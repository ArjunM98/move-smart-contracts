var expect = require('chai').expect;
var requirejs = require('requirejs');
const CTLProperties = requirejs("./src/CTLTransformation/CTLProperties.js");
const CTL = new CTLProperties;

describe('CTLPropertiesForBlindAuction', function () {
    const bipTransitionsToSMVNames = {"a39":"(NuInteraction) = (NuI40)","a19":"(NuInteraction) = (NuI20)","afinish_guard":"(NuInteraction) = (NuI8)","a24":"(NuInteraction) = (NuI25)","a36":"(NuInteraction) = (NuI37)","a25":"(NuInteraction) = (NuI26)","a6":"(NuInteraction) = (NuI7)","a35":"(NuInteraction) = (NuI36)","a33":"(NuInteraction) = (NuI34)","abid_guard":"(NuInteraction) = (NuI1)","a12":"(NuInteraction) = (NuI13)","awithdraw_guard":"(NuInteraction) = (NuI10)","aunbid_revert":"(NuInteraction) = (NuI22)","a26":"(NuInteraction) = (NuI27)","a18":"(NuInteraction) = (NuI19)","a27":"(NuInteraction) = (NuI28)","a17":"(NuInteraction) = (NuI18)","a38":"(NuInteraction) = (NuI39)","acancelABB_guard":"(NuInteraction) = (NuI4)","a32":"(NuInteraction) = (NuI33)","a37":"(NuInteraction) = (NuI38)","a8":"(NuInteraction) = (NuI9)","a40":"(NuInteraction) = (NuI41)","a23":"(NuInteraction) = (NuI24)","acancelRB_guard":"(NuInteraction) = (NuI6)","a2":"(NuInteraction) = (NuI3)","a1":"(NuInteraction) = (NuI2)","aunbid_guard":"(NuInteraction) = (NuI21)","a29":"(NuInteraction) = (NuI30)","a16":"(NuInteraction) = (NuI17)","a4":"(NuInteraction) = (NuI5)","aunbid_no_revert":"(NuInteraction) = (NuI23)","a13":"(NuInteraction) = (NuI14)","areveal_guard":"(NuInteraction) = (NuI31)","a15":"(NuInteraction) = (NuI16)","aclose_guard":"(NuInteraction) = (NuI29)","awithdraw_no_revert":"(NuInteraction) = (NuI12)","a31":"(NuInteraction) = (NuI32)","a34":"(NuInteraction) = (NuI35)","awithdraw_revert":"(NuInteraction) = (NuI11)","a14":"(NuInteraction) = (NuI15)"};
    const actionNamesToTransitionNames = {"bid":"abid_guard","bid.bids[msg.sender].push(Bid({\n blindedBid: blindedBid,\n deposit: msg.value\n }));":"a1","bid.pendingReturns[msg.sender] += msg.value;":"a2","cancelABB":"acancelABB_guard","cancelRB":"acancelRB_guard","finish":"afinish_guard","withdraw":"awithdraw_guard","withdraw.uint amount = pendingReturns[msg.sender];":"a12","withdraw.msg.sender.transfer(amount);":"a15","withdraw.msg.sender.transfer(amount - highestBid);":"a17","withdraw.pendingReturns[msg.sender] = 0;":"a18","unbid":"aunbid_guard","unbid.uint amount = pendingReturns[msg.sender];":"a23","unbid.msg.sender.transfer(amount);":"a25","unbid.pendingReturns[msg.sender] = 0;":"a26","close":"aclose_guard","reveal":"areveal_guard","reveal.uint i = 0;":"a31","reveal.var bid = bids[msg.sender][i];":"a34","reveal.var (value, secret) = (values[i], secrets[i]);":"a35","reveal.highestBid = value;":"a37","reveal.highestBidder = msg.sender;":"a38","reveal.i++;":"a40"};
    context('#generatingCTLProperties', function () {
        context('First Template case', function () {
            // Type 1: <action> cannot happen after <action>": close#finish
            it('Close cannot happen after finish', function () {
                const properties = [[["close"],["finish"]]];

                const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "-- AG ( finish -> AG (!(close)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI29))))\n\n";

                expect(generatedProperties).to.eql(expected);
            })
            // close#finish;cancelRB|cancelABB#finish
            it('Close cannot happen after finish and cancelRB or cancelABB cannot happen after finish', function () {
                const properties = [[["close"],["finish"]],[["cancelRB","cancelABB"],["finish"]]];

                const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "-- AG ( finish -> AG (!(close)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI29))))\n\n-- AG ( finish -> AG (!(cancelRB|cancelABB)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI6)|(NuInteraction) = (NuI4))))\n\n";

                expect(generatedProperties).to.eql(expected);
            })
        })
        context('Second Template case', function () {
            // Type 2: <action> can happen only after <action>
            it('Finish can happen only after reveal', function () {
                const properties = [[["finish"],["reveal"]]];

                const generatedProperties = CTL.generateSecondTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "-- A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))]\nCTLSPEC A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))]\n\n";

                expect(generatedProperties).to.eql(expected);
            })
        })
        context('Third Template case', function () {
            // close#finish#reveal
            // Type 3: If <action> happens, <action> can happen only after <action> happens
            it('If close happens, finish can happen only after reveal happens', function () {
                const properties = [[["close"],["finish"],["reveal"]]];

                const generatedProperties = CTL.generateThirdTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "-- AG (close) -> AX A [ !(finish) U (reveal)]\nCTLSPEC AG (((NuInteraction) = (NuI29)) -> AX A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))])\n\n"; 

                expect(generatedProperties).to.eql(expected);
            })
        })        
        context('Fourth Template case', function () {
            // Type 4: <action> will eventually happen after <action> happens
            it('Finish will eventually happen after reveal happens', function () {
                const properties = [[["finish"],["reveal"]]];

                const generatedProperties = CTL.generateFourthTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "-- AG ((reveal) -> AF (finish))\nCTLSPEC AG (((NuInteraction) = (NuI31)) -> AF ((NuInteraction) = (NuI8)))\n\n"; 

                expect(generatedProperties).to.eql(expected);
            })
        })
    })
    context('#generatingCTLPropertiesTxt', function () {
        context('First Template case', function () {
            // close#finish
            // Type 1: <action> cannot happen after <action>"
            it('Close cannot happen after finish', function () {
                const properties = [[["close"],["finish"]]];

                const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties);
                const expected = "(close) can happen only after (finish)\n";

                expect(generatedProperties).to.eql(expected);
            })
            // close#finish;cancelRB|cancelABB#finish
            it('Close cannot happen after finish and cancelRB or cancelABB cannot happen after finish', function () {
                const properties = [[["close"],["finish"]],[["cancelRB","cancelABB"],["finish"]]]

                const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties);
                const expected = "(close) can happen only after (finish)\n(cancelRB|cancelABB) can happen only after (finish)\n";

                expect(generatedProperties).to.eql(expected);
            })
        })
        context('Second Template case', function () {
            // finish#reveal
            // Type 2: <action> can happen only after <action>
            it('Finish can happen only after reveal', function () {
                const properties = [[["finish"],["reveal"]]];

                const generatedProperties = CTL.generateSecondTemplatePropertiesTxt(properties);
                const expected = "(finish) can happen only after (reveal)\n";

                expect(generatedProperties).to.eql(expected);
            })
        })
        context('Third Template case', function () {
            // close#finish#reveal
            // Type 3: If <action> happens, <action> can happen only after <action> happens
            it('If close happens, finish can happen only after reveal happens', function () {
                const properties = [[["close"],["finish"],["reveal"]]];

                const generatedProperties = CTL.generateThirdTemplatePropertiesTxt(properties);
                const expected = "If (close) happens, (finish) can happen only after (reveal) happens\n";

                expect(generatedProperties).to.eql(expected);

            })
        })        
        context('Fourth Template case', function () {
            // finish#reveal
            // Type 4: <action> will eventually happen after <action> happens
            it('Finish will eventually happen after reveal happens', function () {
                const properties = [[["finish"],["reveal"]]];

                const generatedProperties = CTL.generateFourthTemplatePropertiesTxt(properties);
                const expected = "(finish) will eventually happen after (finish)\n"; 

                expect(generatedProperties).to.eql(expected);
            })
        })
    })
    context('#generatingCTLFairnessProperties', function () {
        context('Second Template case', function () {
            // Type 2: <action> can happen only after <action>
            it('Finish can happen only after reveal', function () {
                const properties = [[["finish"],["reveal"]]];

                const generatedProperties = CTL.generateSecondTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "(NuInteraction) = (NuI8)|"; 

                expect(generatedProperties).to.eql(expected);
            })
        })
        context('Third Template case', function () {
            // close#finish#reveal
            // Type 3: If <action> happens, <action> can happen only after <action> happens
            it('If close happens, finish can happen only after reveal happens', function () {
                const properties = [[["close"],["finish"],["reveal"]]];

                const generatedProperties = CTL.generateThirdTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties);
                const expected = "(NuInteraction) = (NuI31)|"; 

                expect(generatedProperties).to.eql(expected);
            })
        })        
    })
})