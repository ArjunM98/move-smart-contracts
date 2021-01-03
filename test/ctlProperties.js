const expect = require('chai').expect
const requirejs = require('requirejs')
const CTLProperties = requirejs('./src/CTLTransformation/CTLProperties.js')
const CTL = new CTLProperties()

describe('CTLPropertiesForBlindAuction', function () {
  const bipTransitionsToSMVNames = { a39: '(NuInteraction) = (NuI40)', a19: '(NuInteraction) = (NuI20)', afinish_guard: '(NuInteraction) = (NuI8)', a24: '(NuInteraction) = (NuI25)', a36: '(NuInteraction) = (NuI37)', a25: '(NuInteraction) = (NuI26)', a6: '(NuInteraction) = (NuI7)', a35: '(NuInteraction) = (NuI36)', a33: '(NuInteraction) = (NuI34)', abid_guard: '(NuInteraction) = (NuI1)', a12: '(NuInteraction) = (NuI13)', awithdraw_guard: '(NuInteraction) = (NuI10)', aunbid_revert: '(NuInteraction) = (NuI22)', a26: '(NuInteraction) = (NuI27)', a18: '(NuInteraction) = (NuI19)', a27: '(NuInteraction) = (NuI28)', a17: '(NuInteraction) = (NuI18)', a38: '(NuInteraction) = (NuI39)', acancelABB_guard: '(NuInteraction) = (NuI4)', a32: '(NuInteraction) = (NuI33)', a37: '(NuInteraction) = (NuI38)', a8: '(NuInteraction) = (NuI9)', a40: '(NuInteraction) = (NuI41)', a23: '(NuInteraction) = (NuI24)', acancelRB_guard: '(NuInteraction) = (NuI6)', a2: '(NuInteraction) = (NuI3)', a1: '(NuInteraction) = (NuI2)', aunbid_guard: '(NuInteraction) = (NuI21)', a29: '(NuInteraction) = (NuI30)', a16: '(NuInteraction) = (NuI17)', a4: '(NuInteraction) = (NuI5)', aunbid_no_revert: '(NuInteraction) = (NuI23)', a13: '(NuInteraction) = (NuI14)', areveal_guard: '(NuInteraction) = (NuI31)', a15: '(NuInteraction) = (NuI16)', aclose_guard: '(NuInteraction) = (NuI29)', awithdraw_no_revert: '(NuInteraction) = (NuI12)', a31: '(NuInteraction) = (NuI32)', a34: '(NuInteraction) = (NuI35)', awithdraw_revert: '(NuInteraction) = (NuI11)', a14: '(NuInteraction) = (NuI15)' }
  const actionNamesToTransitionNames = { bid: 'abid_guard', 'bid.bids[msg.sender].push(Bid({\n blindedBid: blindedBid,\n deposit: msg.value\n }));': 'a1', 'bid.pendingReturns[msg.sender] += msg.value;': 'a2', cancelABB: 'acancelABB_guard', cancelRB: 'acancelRB_guard', finish: 'afinish_guard', withdraw: 'awithdraw_guard', 'withdraw.uint amount = pendingReturns[msg.sender];': 'a12', 'withdraw.msg.sender.transfer(amount);': 'a15', 'withdraw.msg.sender.transfer(amount - highestBid);': 'a17', 'withdraw.pendingReturns[msg.sender] = 0;': 'a18', unbid: 'aunbid_guard', 'unbid.uint amount = pendingReturns[msg.sender];': 'a23', 'unbid.msg.sender.transfer(amount);': 'a25', 'unbid.pendingReturns[msg.sender] = 0;': 'a26', close: 'aclose_guard', reveal: 'areveal_guard', 'reveal.uint i = 0;': 'a31', 'reveal.var bid = bids[msg.sender][i];': 'a34', 'reveal.var (value, secret) = (values[i], secrets[i]);': 'a35', 'reveal.highestBid = value;': 'a37', 'reveal.highestBidder = msg.sender;': 'a38', 'reveal.i++;': 'a40' }
  context('#generatingCTLProperties', function () {
    context('First Template case', function () {
      // Type 1: <action> cannot happen after <action>": close#finish
      it('Close cannot happen after finish', function () {
        const properties = [[['close'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ( finish -> AG (!(close)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI29))))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
      // close#finish;cancelRB|cancelABB#finish
      it('Close cannot happen after finish and cancelRB or cancelABB cannot happen after finish', function () {
        const properties = [[['close'], ['finish']], [['cancelRB', 'cancelABB'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ( finish -> AG (!(close)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI29))))\n\n-- AG ( finish -> AG (!(cancelRB|cancelABB)))\nCTLSPEC AG ( (NuInteraction) = (NuI8) -> AG (!((NuInteraction) = (NuI6)|(NuInteraction) = (NuI4))))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Second Template case', function () {
      // Type 2: <action> can happen only after <action>
      it('Finish can happen only after reveal', function () {
        const properties = [[['finish'], ['reveal']]]

        const generatedProperties = CTL.generateSecondTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))]\nCTLSPEC A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))]\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // close#finish#reveal
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If close happens, finish can happen only after reveal happens', function () {
        const properties = [[['close'], ['finish'], ['reveal']]]

        const generatedProperties = CTL.generateThirdTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG (close) -> AX A [ !(finish) U (reveal)]\nCTLSPEC AG (((NuInteraction) = (NuI29)) -> AX A [ !((NuInteraction) = (NuI8)) U ((NuInteraction) = (NuI31))])\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Fourth Template case', function () {
      // Type 4: <action> will eventually happen after <action> happens
      it('Finish will eventually happen after reveal happens', function () {
        const properties = [[['finish'], ['reveal']]]

        const generatedProperties = CTL.generateFourthTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ((reveal) -> AF (finish))\nCTLSPEC AG (((NuInteraction) = (NuI31)) -> AF ((NuInteraction) = (NuI8)))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
  })
  context('#generatingCTLPropertiesTxt', function () {
    context('First Template case', function () {
      // close#finish
      // Type 1: <action> cannot happen after <action>"
      it('Close cannot happen after finish', function () {
        const properties = [[['close'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties)
        const expected = '(close) can happen only after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
      // close#finish;cancelRB|cancelABB#finish
      it('Close cannot happen after finish and cancelRB or cancelABB cannot happen after finish', function () {
        const properties = [[['close'], ['finish']], [['cancelRB', 'cancelABB'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties)
        const expected = '(close) can happen only after (finish)\n(cancelRB|cancelABB) can happen only after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Second Template case', function () {
      // finish#reveal
      // Type 2: <action> can happen only after <action>
      it('Finish can happen only after reveal', function () {
        const properties = [[['finish'], ['reveal']]]

        const generatedProperties = CTL.generateSecondTemplatePropertiesTxt(properties)
        const expected = '(finish) can happen only after (reveal)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // close#finish#reveal
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If close happens, finish can happen only after reveal happens', function () {
        const properties = [[['close'], ['finish'], ['reveal']]]

        const generatedProperties = CTL.generateThirdTemplatePropertiesTxt(properties)
        const expected = 'If (close) happens, (finish) can happen only after (reveal) happens\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Fourth Template case', function () {
      // finish#reveal
      // Type 4: <action> will eventually happen after <action> happens
      it('Finish will eventually happen after reveal happens', function () {
        const properties = [[['finish'], ['reveal']]]

        const generatedProperties = CTL.generateFourthTemplatePropertiesTxt(properties)
        const expected = '(finish) will eventually happen after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
  })
  context('#generatingCTLFairnessProperties', function () {
    context('Second Template case', function () {
      // Type 2: <action> can happen only after <action>
      it('Finish can happen only after reveal', function () {
        const properties = [[['finish'], ['reveal']]]

        const generatedProperties = CTL.generateSecondTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '(NuInteraction) = (NuI8)|'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // close#finish#reveal
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If close happens, finish can happen only after reveal happens', function () {
        const properties = [[['close'], ['finish'], ['reveal']]]

        const generatedProperties = CTL.generateThirdTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '(NuInteraction) = (NuI31)|'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('#parsingProperties', function () {
      const blindAuctionModel = { name: 'BlindAuction', states: ['C', 'ABB', 'RB', 'F', 'bid', 's5_1', 'cancelABB', 'cancelRB', 'finish', 'withdraw', 'withdraw_no_revert', 's11_1', 's12_T', 's13_1', 's14_T', 's14_F', 'unbid', 'unbid_no_revert', 's18_1', 's19_T', 's20_1', 'close', 'reveal', 's23_I', 's23_C', 's23_B', 's26_1', 's26_2', 's28_T', 's29_1'], transitions: [{ name: 'abid_guard', actionName: 'bid', src: 'ABB', dst: 'bid', guards: '', input: '    bytes32 blindedBid', output: '', statements: '', tags: 'payable' }, { name: 'a1', actionName: 'bid.bids[msg.sender].push(Bid({\n       blindedBid: blindedBid,\n       deposit: msg.value\n   }));', src: 'bid', dst: 's5_1', guards: '', input: '', output: '', statements: 'bids[msg.sender].push(Bid({\n       blindedBid: blindedBid,\n       deposit: msg.value\n   }));', tags: '' }, { name: 'a2', actionName: 'bid.pendingReturns[msg.sender] += msg.value;', src: 's5_1', dst: 'ABB', guards: '', input: '', output: '', statements: 'pendingReturns[msg.sender] += msg.value;', tags: '' }, { name: 'acancelABB_guard', actionName: 'cancelABB', src: 'ABB', dst: 'cancelABB', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'a4', src: 'cancelABB', dst: 'C', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'acancelRB_guard', actionName: 'cancelRB', src: 'RB', dst: 'cancelRB', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'a6', src: 'cancelRB', dst: 'C', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'afinish_guard', actionName: 'finish', src: 'RB', dst: 'finish', guards: '  now >= creationTime + 10 days', input: '', output: '', statements: '', tags: '' }, { name: 'a8', src: 'finish', dst: 'F', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'awithdraw_guard', actionName: 'withdraw', src: 'F', dst: 'withdraw', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'awithdraw_revert', src: 'withdraw', dst: 'F', guards: 'revert', input: '', output: '', statements: '', tags: '' }, { name: 'awithdraw_no_revert', src: 'withdraw', dst: 'withdraw_no_revert', guards: 'no revert', input: '', output: '', statements: '', tags: '' }, { name: 'a12', actionName: 'withdraw.uint amount = pendingReturns[msg.sender];', src: 'withdraw_no_revert', dst: 's11_1', guards: '', input: '', output: '', statements: 'uint amount = pendingReturns[msg.sender];', tags: '' }, { name: 'a13', src: 's11_1', dst: 's12_T', guards: 'amount > 0', input: '', output: '', statements: '', tags: '' }, { name: 'a14', src: 's12_T', dst: 's14_T', guards: 'msg.sender!= highestBidder', input: '', output: '', statements: '', tags: '' }, { name: 'a15', actionName: 'withdraw.msg.sender.transfer(amount);', src: 's14_T', dst: 's13_1', guards: '', input: '', output: '', statements: 'msg.sender.transfer(amount);', tags: '' }, { name: 'a16', src: 's12_T', dst: 's14_F', guards: '!(msg.sender!= highestBidder)', input: '', output: '', statements: '', tags: '' }, { name: 'a17', actionName: 'withdraw.msg.sender.transfer(amount - highestBid);', src: 's14_F', dst: 's13_1', guards: '', input: '', output: '', statements: 'msg.sender.transfer(amount - highestBid);', tags: '' }, { name: 'a18', actionName: 'withdraw.pendingReturns[msg.sender] = 0;', src: 's13_1', dst: 'F', guards: '', input: '', output: '', statements: 'pendingReturns[msg.sender] = 0;', tags: '' }, { name: 'a19', src: 's11_1', dst: 'F', guards: '!(amount > 0)', input: '', output: '', statements: '', tags: '' }, { name: 'aunbid_guard', actionName: 'unbid', src: 'C', dst: 'unbid', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'aunbid_revert', src: 'unbid', dst: 'C', guards: 'revert', input: '', output: '', statements: '', tags: '' }, { name: 'aunbid_no_revert', src: 'unbid', dst: 'unbid_no_revert', guards: 'no revert', input: '', output: '', statements: '', tags: '' }, { name: 'a23', actionName: 'unbid.uint amount = pendingReturns[msg.sender];', src: 'unbid_no_revert', dst: 's18_1', guards: '', input: '', output: '', statements: 'uint amount = pendingReturns[msg.sender];', tags: '' }, { name: 'a24', src: 's18_1', dst: 's19_T', guards: 'amount > 0', input: '', output: '', statements: '', tags: '' }, { name: 'a25', actionName: 'unbid.msg.sender.transfer(amount);', src: 's19_T', dst: 's20_1', guards: '', input: '', output: '', statements: 'msg.sender.transfer(amount);', tags: '' }, { name: 'a26', actionName: 'unbid.pendingReturns[msg.sender] = 0;', src: 's20_1', dst: 'C', guards: '', input: '', output: '', statements: 'pendingReturns[msg.sender] = 0;', tags: '' }, { name: 'a27', src: 's18_1', dst: 'C', guards: '!(amount > 0)', input: '', output: '', statements: '', tags: '' }, { name: 'aclose_guard', actionName: 'close', src: 'ABB', dst: 'close', guards: 'now > creationTime + 5 days', input: '', output: '', statements: '', tags: '' }, { name: 'a29', src: 'close', dst: 'RB', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'areveal_guard', actionName: 'reveal', src: 'RB', dst: 'reveal', guards: 'values.length == secrets.length', input: '  uint[] values, bytes32[] secrets', output: '', statements: '', tags: '' }, { name: 'a31', actionName: 'reveal.uint i = 0;', src: 'reveal', dst: 's23_I', guards: '', input: '', output: '', statements: 'uint i = 0;', tags: '' }, { name: 'a32', src: 's23_I', dst: 'RB', guards: '!(i < (bids[msg.sender].length < values.length ? \n        bids[msg.sender].length : values.length))', input: '', output: '', statements: '', tags: '' }, { name: 'a33', src: 's23_I', dst: 's23_C', guards: 'i < (bids[msg.sender].length < values.length ? \n        bids[msg.sender].length : values.length)', input: '', output: '', statements: '', tags: '' }, { name: 'a34', actionName: 'reveal.var bid = bids[msg.sender][i];', src: 's23_C', dst: 's26_1', guards: '', input: '', output: '', statements: 'var bid = bids[msg.sender][i];', tags: '' }, { name: 'a35', actionName: 'reveal.var (value, secret) = (values[i], secrets[i]);', src: 's26_1', dst: 's26_2', guards: '', input: '', output: '', statements: 'var (value, secret) = (values[i], secrets[i]);', tags: '' }, { name: 'a36', src: 's26_2', dst: 's28_T', guards: 'bid.blindedBid == keccak256(value, secret) && \n              bid.deposit >= value && value > highestBid', input: '', output: '', statements: '', tags: '' }, { name: 'a37', actionName: 'reveal.highestBid = value;', src: 's28_T', dst: 's29_1', guards: '', input: '', output: '', statements: 'highestBid = value;', tags: '' }, { name: 'a38', actionName: 'reveal.highestBidder = msg.sender;', src: 's29_1', dst: 's23_B', guards: '', input: '', output: '', statements: 'highestBidder = msg.sender;', tags: '' }, { name: 'a39', src: 's26_2', dst: 's23_B', guards: '!(bid.blindedBid == keccak256(value, secret) && \n              bid.deposit >= value && value > highestBid)', input: '', output: '', statements: '', tags: '' }, { name: 'a40', actionName: 'reveal.i++;', src: 's23_B', dst: 's23_I', guards: '', input: '', output: '', statements: 'i++;', tags: '' }], initialState: 'ABB', finalStates: ['C', 'F'] }
      context('Parsing with template 1', function () {
        it('1 statement parsing', function () {
          const input = 'close#finish'

          const parsedProperties = CTL.parseProperties(blindAuctionModel, input)
          const expected = [[['close'], ['finish']]]

          expect(parsedProperties).to.eql(expected)
        })
        it('2 statement parsing', function () {
          const input = 'close#finish;cancelRB|cancelABB#finish'

          const parsedProperties = CTL.parseProperties(blindAuctionModel, input)
          const expected = [[['close'], ['finish']], [['cancelRB', 'cancelABB'], ['finish']]]

          expect(parsedProperties).to.eql(expected)
        })
      })
    })
  })
})
