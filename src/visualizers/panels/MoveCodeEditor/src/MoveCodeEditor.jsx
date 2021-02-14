import React, { useState, useEffect } from 'react';
import { Button, Container } from '@material-ui/core';
import Editor from '@monaco-editor/react';
// import GraphEditor from 'webgme-react-components/src/components/GraphEditor';

const MoveCodeEditor = ({ gmeClient, initialState }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState("// Write your code here");


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

    // const getAllFunctions = () => {
    //     var codeContent = code;
    //     //Get all modifier names - Move doesnt have modifiers
    //     // var modifiersList = codeContent.match(/modifier [^\{}]*/g);
    //     // var mNames = [];
    //     // if (modifiersList) {
    //     //     for (var i = 0; i < modifiersList.length; i++) {
    //     //         var mName = {};
    //     //         mName.name = modifiersList[i].match(/modifier [^\()]*/g)[0].replace('modifier ', '');

    //     //         if(i != modifiersList.length-1){
    //     //             var body = codeContent.substring(codeContent.indexOf(modifiersList[i]) + modifiersList[i].length + 1, codeContent.indexOf(modifiersList[i + 1]));
    //     //             body = body.trim().substring(0, body.length - 2);
    //     //             body = body.replace('_;', '').replace('}','').replace('if (','').replace('))', ')');
    //     //             mName.condition = body;
    //     //         } else {
    //     //             var body = codeContent.substring(codeContent.indexOf(modifiersList[i]) + modifiersList[i].length + 1, codeContent.indexOf('function')-1);
    //     //             body = body.trim().substring(0, body.length - 2);
    //     //             body = body.replace('_;', '').replace('}','').replace('if (','').replace('))', ')');
    //     //             mName.condition = body;
    //     //         }
    //     //         mNames.push(mName);
    //     //     }
    //     // }

    //     //Get all function names
    //     var fNames = [];
    //     var functionDefinitionList = codeContent.match(/function [^\{}]*/g);
    //     if (functionDefinitionList) {
    //         for (var i = 0; i < functionDefinitionList.length; i++) {
    //             var fName = {};
    //             fName.definition = functionDefinitionList[i];
    //             fName.name = functionDefinitionList[i].match(/function [^\()]*/g)[0].replace('function ', '');
    //             // fName.modifiers = [];
    //             fName.outputs = '';
    //             fName.inputs = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('(')+1, functionDefinitionList[i].indexOf(')'));
    //             if(functionDefinitionList[i].indexOf('returns') != -1) {
    //                 var returnval = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('returns')+1);
    //                 fName.outputs = returnval.substring(returnval.indexOf('(')+1, returnval.indexOf(')'));
    //                 fName.tags = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf(')')+1, functionDefinitionList[i].indexOf('returns'));
    //             } else {
    //                 fName.tags = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf(')')+1);
    //             }


    //             // mNames.forEach(mn => {
    //             //     if (functionDefinitionList[i].indexOf(mn.name) !== -1) {
    //             //         fName.modifiers.push(mn.name);
    //             //     }
    //             // });

    //             //Moving internal function code
    //             if (i != functionDefinitionList.length - 1) {
    //                 var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().indexOf(functionDefinitionList[i + 1]));
    //                 body = body.trim().substring(0, body.trim().length - 1);
    //                 fName.code = body;
    //             } else {
    //                 var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().length - 1);
    //                 body = body.trim().substring(0, body.trim().length - 1);
    //                 fName.code = body;
    //             }

    //             //Loading inputs for each function
    //             fNames.push(fName);
    //         }
    //     }
    //     return fNames;
    // };

    // const getVariableDefinitions = () => {
    //     var definitions = '';
    //     var codeContent = code;

    //     var defaultdef = 'uint private creationTime = now;';
    //     var stateDef = 'enum States';

    //     definitions = codeContent.substring(codeContent.indexOf(defaultdef) + defaultdef.length + 1, codeContent.indexOf(stateDef));

    //     //Loading modifiers

    //     // if(codeContent.indexOf('modifier') != -1){
    //     //     definitions += codeContent.substring(codeContent.indexOf('modifier'), codeContent.indexOf('function'));
    //     // }

    //     return definitions;
    // };

    // const handleGenerateFSM = () => {
    //     var self = this,
    //                core,
    //                all_promises = [];
    //     var fNames = getAllFunctions();
    //     // var node = self._client.getNode(WebGMEGlobal.State.getActiveObject());
    //     // self._client.startTransaction();

    //     self._client.setAttribute(node.getId(), 'definitions', getVariableDefinitions());
    //     //Creating initial state
    //     var initialState = self._client.createChild({ parentId: node.getId(), baseId: '/m/z' });
    //     var deferred = Q.defer();
    //     fNames.forEach(fn => {

    //         var transition = self._client.createChild({ parentId: node.getId(), baseId: '/m/A' });

    //         self._client.setAttribute(transition, 'name', fn.name);
    //         self._client.setAttribute(transition, 'statements', fn.code);
    //         self._client.setAttribute(transition, 'input', fn.inputs);
    //         self._client.setAttribute(transition, 'output', fn.outputs);
    //         self._client.setAttribute(transition, 'tags', fn.tags);
    //         self._client.setPointer(transition, 'src', initialState);
    //         self._client.setPointer(transition, 'dst', initialState);
    //         if (fn.modifiers.length > 0) {
    //             self._client.setAttribute(transition, 'guards', fn.modifiers.join(','));
    //         }
    //         deferred.resolve(fn);
    //         all_promises.push(deferred.promise);
    //     });

    //     self._client.completeTransaction();
    //     return Q.all(all_promises);
    // };



    const test = () => {
        console.log("Testing");
        const Q = require('q');

        // Printing the names of the visualizers
        const VisualizersJSON = window.WebGMEGlobal.allVisualizers;
        for (i = 0; i < VisualizersJSON.length; i += 1) {
            console.log(i + " : " + VisualizersJSON[i].id + "\n");
        }

        // TODO dont forget to remove the hardcoded value
        // console.log(otherPanel.Client.getAllNodes());
        // const node = window.WebGMEGlobal.Client.getNode("/m/A");
        // const node = window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes["/9/b"];
        // console.log("node = "+ node.getId());

        // var initialState = window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes['/9/b/ykY'];
        // const initialState = "/9/b/ykY";

        // var storage = [];

        // loop through the children
        // if a children is a transition (if statements key exists)
        // check source & destination and if its either node then delete the transition first then node
        // Object.keys(window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes['/9/b/ykY'].node.parent.children).forEach((key1) => {
        //     if ("statement" in window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes['/9/b/ykY'].node.parent.children[key1].data.atr){
        //         window.WebGMEGlobal.InterpreterManager._client.deletePointer(key1);
        //     }
        // })  

        // console.log()

        // Object.keys(window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[0]._state.nodes).forEach( (key) => {
        //     // console.log("Key: "+ key);
        //     // console.log(window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[0]._state.nodes[key].node)
        //     console.log(key + " and type= " + typeof(key))
        //     if (key.includes("/9/b/") && (key !== "/9/b" && key !== "/9/b/ykY")){
        //         // window.WebGMEGlobal.InterpreterManager._client.deleteNode(key);
        //         // window.WebGMEGlobal.Client.deleteNode(key)
        //         storage.push(key);
        //         // console.log("deleted: "+ key);
        //     }
        // })


        // window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b"].node.childrenRelids.forEach((key) => {
        //     // console.log("Key: "+ key);
        //     // console.log(window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes[key].node)
        //     //     // window.WebGMEGlobal.InterpreterManager._client.deleteNode(key);
        //     //     storage.push(key);
        //     //     // console.log("deleted: "+ key);
        //     // }
            
        //     console.log("Trying to delete: " + "/9/b/"+key);
        //     if (window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b/"+key].node.data.atr.hasOwnProperty('statements')){
        //         window.WebGMEGlobal.Client.deletePointer("/9/b/"+key, window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b/"+key].node.data.atr.name);
        //     } else {
        //         // window.WebGMEGlobal.Client.deleteNode("/9/b/"+key);
        //         console.log("Skipping the nodes");
        //     }
        // })

        // window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b"].node.childrenRelids.forEach((key) => {
        //     // console.log("Key: "+ key);
        //     // console.log(window.WebGMEGlobal.InterpreterManager._client.getAllMetaNodes()[6]._state.nodes[key].node)
        //     //     // window.WebGMEGlobal.InterpreterManager._client.deleteNode(key);
        //     //     storage.push(key);
        //     //     // console.log("deleted: "+ key);
        //     // }
            
        //     console.log("Trying to delete: " + "/9/b/"+key);
        //     if (window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b/"+key].node.data.atr.hasOwnProperty('statements')){
        //         window.WebGMEGlobal.Client.deletePointer("/9/b/"+key, window.WebGMEGlobal.Client.getNode("/9/b")._state.nodes["/9/b/"+key].node.data.atr.name);
        //     } else {
        //         window.WebGMEGlobal.Client.deleteNode("/9/b/"+key);
        //         // console.log("Skipping the nodes");
        //     }
        // })
        

       
        // console.log(storage);

        // storage.forEach((a) => {
        //     // window.WebGMEGlobal.InterpreterManager._client.deleteNode(a);
        //     window.WebGMEGlobal.Client.deleteNode(a);
        // })

        // window.WebGMEGlobal.InterpreterManager._client.startTransaction();

        // var del = window.WebGMEGlobal.Client.getNode(["/9/b"])._state.nodes["/9/b"].node.childrenRelids
        // while (del != []){
        //     del.forEach((a) => {
        //         window.WebGMEGlobal.Client.deleteNode("/9/b/"+a);
        //     });
        // }
        // del.forEach((a) => {
        //     window.WebGMEGlobal.Client.deleteNode("/9/b/"+a);
        // });

        // window.WebGMEGlobal.WebGMEReactPanels[

        var del = gmeClient.getNode(initialState.activeNode).getChildrenIds();

        // for (var i = 0; i < del.length; i++){
        //     if (!del[i].startsWith("/9/b")){
        //         del[i] = "/9/b/"+del[i];
        //     }
        // }

        console.log("del = " + del);

        // window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].client

        // window.WebGMEGlobal.Client.getNode(["/9/b"])._state.nodes["/9/b"].node.childrenRelids.forEach(item => {
        //     item = "/9/b/"+item;
        // });
    

        // remember to change the definition of /9/b
        // remember to change its attributes specifically: name, imports, and resources
        
        gmeClient.startTransaction();

        // window.WebGMEGlobal.Client.deleteNodes(del);

        gmeClient.deleteNodes(del);

        //Creation
        // window.WebGMEGlobal.InterpreterManager._client.setAttribute('/9/b', 'definitions', 'none');
        // otherPanel.Client.setAttribute(node.getId(), 'definitions', "whatever");
        // window.WebGMEGlobal.InterpreterManager._client.setAttribute("/9/b", 'definitions', "best");
        var state =  gmeClient.createChild({parentId: initialState.activeNode, baseId: '/m/9'});
        
        var deferred = Q.defer();
        var all_promises = [];
        ["name1", "name2"].forEach(fn => {

            var transition = gmeClient.createChild({ parentId: initialState.activeNode, baseId: '/m/A' });

            gmeClient.setAttribute(transition, 'name', fn);
            gmeClient.setAttribute(transition, 'statements', fn);
            gmeClient.setAttribute(transition, 'input', fn);
            gmeClient.setAttribute(transition, 'output', fn);
            gmeClient.setAttribute(transition, 'tags', fn);
            gmeClient.setPointer(transition, 'src', state);
            gmeClient.setPointer(transition, 'dst', state);
            // if (fn.length > 0) {
            //     self._client.setAttribute(transition, 'guards', fn.modifiers.join(','));
            // }
            deferred.resolve(fn);
            all_promises.push(deferred.promise);
        });
        gmeClient.completeTransaction();
        return Q.all(all_promises);
    }

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

                <Editor
                    height="65vh"
                    language="rust"
                    value={code}
                    theme="dark"
                />
            </Container>
    );

    return (
        loading ? <h2> Loading... </h2> : renderContent()
    );
}

export default MoveCodeEditor;
