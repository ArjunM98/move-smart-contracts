import React, { useState, useEffect, useRef } from 'react';
import { Button, Container } from '@material-ui/core';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/theme-monokai";

const MoveCodeEditor = ({ gmeClient, initialState }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState("// Write your code here");

    function onEditorChange(newValue) {
        console.log("changed", newValue);
        setCode(newValue);
    }

    // componentDidMount() sideEffect
    useEffect(() => {
        let regex = /^\/9\/[^\/]*$/g;

        if (initialState.activeNode.match(regex)) {
            const contract = gmeClient.getNode(initialState.activeNode);
            const generatedCode = contract.getAttribute("generatedMoveCode");
            const customCode = contract.getAttribute("customMoveCode");

            if (customCode) {
                setCode(customCode);
            } else if (generatedCode) {
                setCode(generatedCode)
            }
        }
        else {
            setError("This visualizer is specifically for contracts.")
        }

        setLoading(false);
    }, [])

    const handleShowGeneratedCode = () => {
        const contract = gmeClient.getNode(initialState.activeNode);
        const generatedCode = contract.getAttribute("generatedMoveCode");

        if (generatedCode) {
            setCode(generatedCode);
        } else {
            setCode("// No generated code found, run the MoveCodeGenerator plugin and press the view button again.");
        }
    };

    const handleShowSavedCode = () => {
        const contract = gmeClient.getNode(initialState.activeNode);
        const savedCode = contract.getAttribute("customMoveCode");

        if (savedCode) {
            setCode(savedCode);
        } else {
            setCode("// No saved code found, write your own code and save it!");
        }
    };

    const saveCode = () => {
        const contract = gmeClient.getNode(initialState.activeNode);
        gmeClient.setAttribute(contract.getId(), "customMoveCode", code);
    }

    const getAllFunctions = (codeContent) => {
        // var codeContent = "address 0x1 { module auction { use 0x1::Diem::Diem; use 0x1::DiemAccount; use 0x1::Signer; use 0x1::DiemTimestamp; resource struct auction_res { currState : vector<u8> } resource struct Auction<Currency> { max_bid: Diem<Currency>, bidder: address, start_at: u64 } fun create (ownerAddr : &signer) { move_to<auction_res>(ownerAddr, auction_res { currState: b'AB' }); } fun bid (ownerAddr : address, bidder_addr: address, auction_owner_addr: address, bid: Diem<Currency>)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); let bid_amt = Diem::value(&bid); let max_bid = Diem::value(&auction.max_bid);  assert(bid_amt > max_bid, 1); assert(bidder_addr != auction.bidder, 1);  if (max_bid > 0) { let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid); DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b'', b'');  };  Diem::deposit(&mut auction.max_bid, bid);  *auction.bidder = bidder_addr; //State change\n *baseResource.currState = b'AB'; } fun finish (ownerAddr : address, auction_owner: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());  //State change\n *baseResource.currState = b'F'; } fun start (ownerAddr : address, auction_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == C); assert(exists<Auction<Currency>>(auction_addr)); //State change\n *baseResource.currState = b'AB'; } fun withdraw (ownerAddr : address, auction_owner_addr: address, bidder_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == F); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let Auction { bid, bidder: _, start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr); let bid_amount = Diem::value(&bid); DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b'', b'');  //State change\n *baseResource.currState = b'F';}}}";
        console.log("functionDefinitionList :"+codeContent);
        //Get all function names
        var fNames = [];
        var functionDefinitionList = codeContent.match(/fun [^\{}]*/g);

        if (functionDefinitionList) {
            for (var i = 0; i < functionDefinitionList.length; i++) {
                var fName = {};
                fName.definition = functionDefinitionList[i];
                fName.name = functionDefinitionList[i].match(/fun [^\()]*/g)[0].replace('function ', '');
                // fName.modifiers = [];
                fName.outputs = '';
                fName.inputs = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('(')+1, functionDefinitionList[i].indexOf(')'));
                if(functionDefinitionList[i].indexOf('return') != -1) {
                    var returnval = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('return')+1);
                    fName.outputs = returnval.substring(returnval.indexOf('(')+1, returnval.indexOf(')'));
                    // fName.tags = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf(')')+1, functionDefinitionList[i].indexOf('return'));
                }


                // mNames.forEach(mn => {
                //     if (functionDefinitionList[i].indexOf(mn.name) !== -1) {
                //         fName.modifiers.push(mn.name);
                //     }
                // });

                //Moving internal function code
                if (i != functionDefinitionList.length - 1) {
                    var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().indexOf(functionDefinitionList[i + 1]));
                    body = body.trim().substring(0, body.trim().length - 1);
                    fName.code = body;
                } else {
                    var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().length - 1);
                    body = body.trim().substring(0, body.trim().length - 1);
                    fName.code = body;
                }

                //Loading inputs for each function
                fNames.push(fName);
            }
        }
        return fNames;
    };

    const getResouces = (codeContent) => {
        // var codeContent = "address 0x1 { module auction { use 0x1::Diem::Diem; use 0x1::DiemAccount; use 0x1::Signer; use 0x1::DiemTimestamp; resource struct auction_res { currState : vector<u8> } resource struct Auction<Currency> { max_bid: Diem<Currency>, bidder: address, start_at: u64 } fun create (ownerAddr : &signer) { move_to<auction_res>(ownerAddr, auction_res { currState: b'AB' }); } fun bid (ownerAddr : address, bidder_addr: address, auction_owner_addr: address, bid: Diem<Currency>)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); let bid_amt = Diem::value(&bid); let max_bid = Diem::value(&auction.max_bid);  assert(bid_amt > max_bid, 1); assert(bidder_addr != auction.bidder, 1);  if (max_bid > 0) { let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid); DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b'', b'');  };  Diem::deposit(&mut auction.max_bid, bid);  *auction.bidder = bidder_addr; //State change\n *baseResource.currState = b'AB'; } fun finish (ownerAddr : address, auction_owner: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());  //State change\n *baseResource.currState = b'F'; } fun start (ownerAddr : address, auction_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == C); assert(exists<Auction<Currency>>(auction_addr)); //State change\n *baseResource.currState = b'AB'; } fun withdraw (ownerAddr : address, auction_owner_addr: address, bidder_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == F); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let Auction { bid, bidder: _, start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr); let bid_amount = Diem::value(&bid); DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b'', b'');  //State change\n *baseResource.currState = b'F';}}}";
        const temp = codeContent.match(/resource.+?(?=})+}/g)//^resource.+?(?=})+}/gms);
        console.log("FAILS INSIDE RESOURCES", temp);
        return temp
    }
    const getImports = (codeContent) => {
        // var codeContent = "address 0x1 { module auction { use 0x1::Diem::Diem; use 0x1::DiemAccount; use 0x1::Signer; use 0x1::DiemTimestamp; resource struct auction_res { currState : vector<u8> } resource struct Auction<Currency> { max_bid: Diem<Currency>, bidder: address, start_at: u64 } fun create (ownerAddr : &signer) { move_to<auction_res>(ownerAddr, auction_res { currState: b'AB' }); } fun bid (ownerAddr : address, bidder_addr: address, auction_owner_addr: address, bid: Diem<Currency>)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); let bid_amt = Diem::value(&bid); let max_bid = Diem::value(&auction.max_bid);  assert(bid_amt > max_bid, 1); assert(bidder_addr != auction.bidder, 1);  if (max_bid > 0) { let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid); DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b'', b'');  };  Diem::deposit(&mut auction.max_bid, bid);  *auction.bidder = bidder_addr; //State change\n *baseResource.currState = b'AB'; } fun finish (ownerAddr : address, auction_owner: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());  //State change\n *baseResource.currState = b'F'; } fun start (ownerAddr : address, auction_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == C); assert(exists<Auction<Currency>>(auction_addr)); //State change\n *baseResource.currState = b'AB'; } fun withdraw (ownerAddr : address, auction_owner_addr: address, bidder_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == F); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let Auction { bid, bidder: _, start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr); let bid_amount = Diem::value(&bid); DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b'', b'');  //State change\n *baseResource.currState = b'F';}}}";
        const temp = codeContent.match(/use.+?(?=;)/g);
        console.log("FAILS INSIDE IMPORTS", temp);
        return temp
    }

    const test = () => {
        console.log("in Testing");
        const Q = require('q');

        // var codeContent = "address 0x1 { module auction { use 0x1::Diem::Diem; use 0x1::DiemAccount; use 0x1::Signer; use 0x1::DiemTimestamp; resource struct auction_res { currState : vector<u8> } resource struct Auction<Currency> { max_bid: Diem<Currency>, bidder: address, start_at: u64 } fun create (ownerAddr : &signer) { move_to<auction_res>(ownerAddr, auction_res { currState: b'AB' }); } fun bid (ownerAddr : address, bidder_addr: address, auction_owner_addr: address, bid: Diem<Currency>)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); let bid_amt = Diem::value(&bid); let max_bid = Diem::value(&auction.max_bid);  assert(bid_amt > max_bid, 1); assert(bidder_addr != auction.bidder, 1);  if (max_bid > 0) { let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid); DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b'', b'');  };  Diem::deposit(&mut auction.max_bid, bid);  *auction.bidder = bidder_addr; //State change\n *baseResource.currState = b'AB'; } fun finish (ownerAddr : address, auction_owner: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == AB); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr); assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());  //State change\n *baseResource.currState = b'F'; } fun start (ownerAddr : address, auction_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == C); assert(exists<Auction<Currency>>(auction_addr)); //State change\n *baseResource.currState = b'AB'; } fun withdraw (ownerAddr : address, auction_owner_addr: address, bidder_addr: address)  acquires { let baseResource = borrow_global_mut<auction_res>(ownerAddr); assert(baseResource.currState == F); //State change\n *baseResource.currState = b'InTransition'; //Actions\n let Auction { bid, bidder: _, start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr); let bid_amount = Diem::value(&bid); DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b'', b'');  //State change\n *baseResource.currState = b'F';}}}";

        var codeContent = code;
        
        var del = gmeClient.getNode(initialState.activeNode).getChildrenIds();
        console.log('del='+del)

        var names = getAllFunctions(codeContent);
        console.log("nameFSM:",  names)
        // WebGMEGlobal.State.registerActiveVisualizer('ModelEditor');
        // WebGMEGlobal.State.registerActiveVisualizer('MoveCodeEditor');
        // console.log("RELOADING");
        // window.location.reload();
        // return;
        
        gmeClient.startTransaction();

        // Deletion of prev nodes
        gmeClient.deleteNodes(del);

        var errored = false;

        //Creation of state node with all transitions
        var state = gmeClient.createChild({parentId: initialState.activeNode, baseId: '/m/9'});

        var deferred = Q.defer();
        var all_promises = [];
        getAllFunctions(codeContent).forEach(fn => {
            var transition = gmeClient.createChild({ parentId: initialState.activeNode, baseId: '/m/A' });
            try {
                gmeClient.setAttribute(state, 'name', 'core');
                gmeClient.setAttribute(transition, 'name', fn.name);
                gmeClient.setAttribute(transition, 'statements', fn.code);
                gmeClient.setAttribute(transition, 'input', fn.inputs);
                gmeClient.setAttribute(transition, 'output', fn.outputs);
                // gmeClient.setAttribute(transition, 'tags', fn.tags);
                gmeClient.setPointer(transition, 'src', state);
                gmeClient.setPointer(transition, 'dst', state);
            } catch (err){
                console.log("error occurred please reload and continue");
                errored = true;
            }
            
            // if (fn.length > 0) {
            //     self._client.setAttributes(transition, 'guards', fn.modifiers.join(','));
            // }
            deferred.resolve(fn);
            all_promises.push(deferred.promise);
        });

        //Creation of initial state node
        var initState = gmeClient.createChild({parentId: initialState.activeNode, baseId: '/m/z'});
        var createTransition = gmeClient.createChild({ parentId: initialState.activeNode, baseId: '/m/g' });
        var createLoop = gmeClient.createChild({ parentId: initialState.activeNode, baseId: '/m/g' });
            
        try {
            gmeClient.setAttribute(initState, 'name', 'C');
            var node = gmeClient.getNode(initialState.activeNode);
            const contractName = node.getAttribute('name');
            console.log("FAILS HerE")
            console.log("IMPORTS = "+ getImports(codeContent))
            console.log("RESOURCES = "+ getResouces(codeContent))
            gmeClient.setAttribute(initialState.activeNode, 'imports', getImports(codeContent).join('\n'));
            gmeClient.setAttribute(initialState.activeNode, 'resources', getResouces(codeContent).join('\n'));

            gmeClient.setAttribute(createTransition, 'name', "start");
            gmeClient.setAttribute(createTransition, 'guards', "exists<"+contractName+"<Currency>>("+contractName+"_addr)");
            gmeClient.setAttribute(createTransition, 'input', contractName+"_addr: address");
            gmeClient.setAttribute(createTransition, 'output', "");
            // gmeClient.setAttribute(createTransition, 'tags', "");
            gmeClient.setPointer(createTransition, 'src', initState);
            gmeClient.setPointer(createTransition, 'dst', state);

            gmeClient.setAttribute(createLoop, 'name', "create");
            gmeClient.setAttribute(createLoop, 'statements', "");
            gmeClient.setAttribute(createLoop, 'input', contractName+"_owner: &signer");
            gmeClient.setAttribute(createLoop, 'output', "let "+contractName+"_owner_addr = Signer::address_of("+contractName+"_owner);\nmove_to<"+contractName+"<Currency>>("+contractName+"_owner, T {Diem::zero<Currency>(),\n"+contractName+"_owner_addr,\nDiemTimestamp::now_seconds()});");
            // gmeClient.setAttribute(createLoop, 'tags', "");
            gmeClient.setPointer(createLoop, 'src', initState);
            gmeClient.setPointer(createLoop, 'dst', initState);

            
        } catch (err) {
            errored = true;
            console.log("error occurred please reload and continue");
        }
        return Q.all(all_promises).then(() => {
            if (!errored){
                gmeClient.completeTransaction();
                WebGMEGlobal.State.registerActiveVisualizer('ModelEditor');
                gmeClient.notifyUser({message: "Success! FSM has been generated", severity: "success"});
            }
            else {
                gmeClient.notifyUser({message: "Node loading error occurred please reload the page and try again", severity: "danger"});
                setError("Node loading error occurred please reload the page and try again");
                // window.location.reload();
            }
        });
    };

    const handleGenerateFSM = () => {
        test();
    };

    const renderContent = () => (
        error ? <h3> {error} </h3> :
            <Container>
                <h2 className="center"> Move Code Editor </h2>

                <p>
                    The code editor displays the current Move code associated with this contract.
                    Custom code can be written and saved to this contract through the "Save" button.
                    If an FSM is defined for this contract, then you can also run the MoveCodeGenerator plugin to autogenerate Move code for it.
                    This generated code can be viewed in the editor through the "View Generated Code" button.
                    <b> The generated code shown is based on the LAST successful plugin run. </b>
                    Saved custom code can be viewed in the editor through the "View Saved Code" button.
                    On startup, if no custom code is defined, generated code will be shown by default assuming the plugin has been ran before.
                </p>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem" }}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleShowSavedCode}
                >
                    View Saved Code
                </Button>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem" }}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleShowGeneratedCode}
                >
                    View Generated Code
                </Button>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem" }}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleGenerateFSM}
                >
                    Generate FSM
                </Button>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem", marginLeft: "185px" }}
                    variant="contained"
                    color="secondary"
                    size="medium"
                    onClick={saveCode}
                >
                    Save Code
                </Button>

                <AceEditor
                    width="750px"
                    mode="rust"
                    name="Move Code Editor"
                    theme="monokai"
                    value={code}
                    fontSize={12}
                    highlightActiveLine={true}
                    showPrintMargin={true}
                    showGutter={true}
                    onChange={onEditorChange}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 2,
                    }}
                />
            </Container>
    );

    return (
        loading ? <h2> Loading... </h2> : renderContent()
    );
}

export default MoveCodeEditor;
