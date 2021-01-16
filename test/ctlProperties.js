const expect = require('chai').expect
const requirejs = require('requirejs')
const CTLProperties = requirejs('./src/CTLTransformation/CTLProperties.js')
const CTL = new CTLProperties()

describe('CTLPropertiesForBlindAuction', function () {
  const bipTransitionsToSMVNames = { afinish_guard: '(NuInteraction) = (NuI19)', a9: '(NuInteraction) = (NuI10)', a12: '(NuInteraction) = (NuI13)', a14: '(NuInteraction) = (NuI15)', acreate_guard: '(NuInteraction) = (NuI22)', a15: '(NuInteraction) = (NuI16)', abid_guard: '(NuInteraction) = (NuI7)', astart_guard: '(NuInteraction) = (NuI1)', a3: '(NuInteraction) = (NuI4)', a4: '(NuInteraction) = (NuI5)', a13: '(NuInteraction) = (NuI14)', a20: '(NuInteraction) = (NuI21)', a22: '(NuInteraction) = (NuI23)', awithdraw_guard: '(NuInteraction) = (NuI3)', a7: '(NuInteraction) = (NuI8)', a16: '(NuInteraction) = (NuI17)', a10: '(NuInteraction) = (NuI11)', a23: '(NuInteraction) = (NuI24)', a8: '(NuInteraction) = (NuI9)', a17: '(NuInteraction) = (NuI18)', a19: '(NuInteraction) = (NuI20)', a5: '(NuInteraction) = (NuI6)', a11: '(NuInteraction) = (NuI12)', a1: '(NuInteraction) = (NuI2)' }
  const actionNamesToTransitionNames =  { start: 'astart_guard', withdraw: 'awithdraw_guard', 'withdraw.let Auction {     \n\tbid,     \n    bidder: _,     \n    start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr);': 'a3', 'withdraw.let bid_amount = Diem::value(&bid);': 'a4', 'withdraw.DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b"", b"");': 'a5', bid: 'abid_guard', 'bid.let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);': 'a7', 'bid.let bid_amt = Diem::value(&bid);': 'a8', 'bid.let max_bid = Diem::value(&auction.max_bid);': 'a9', 'bid.assert(bid_amt > max_bid, 1);': 'a10', 'bid.assert(bidder_addr != auction.bidder, 1);': 'a11', 'bid.let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid);': 'a13', 'bid.DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b"", b"");': 'a14', 'bid.Diem::deposit(&mut auction.max_bid, bid);': 'a16', 'bid.*auction.bidder = bidder_addr;': 'a17', finish: 'afinish_guard', 'finish.let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);': 'a19', 'finish.assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());': 'a20', create: 'acreate_guard', 'create.let auction_owner_addr = Signer::address_of(auction_owner);': 'a22', 'create.move_to<Auction<Currency>>(auction_owner, T {     \n\t\t\t\t\t\t\t\t\t\t\t\tDiem::zero<Currency>(),     \n                                                auction_owner_addr,     \n                                                DiemTimestamp::now_seconds() \n                                             }\n                           );': 'a23' }
  context('#generatingCTLProperties', function () {
    context('First Template case', function () {
      // Type 1: <action> cannot happen after <action>": bid#finish
      it('bid cannot happen after finish', function () {
        const properties = [[['bid'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ( finish -> AG (!(bid)))\nCTLSPEC AG ( (NuInteraction) = (NuI19) -> AG (!((NuInteraction) = (NuI7))))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
      // start|bid#finish
      it('start or bid cannot happen after finish', function () {
        const properties = [[['start','bid'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ( finish -> AG (!(start|bid)))\nCTLSPEC AG ( (NuInteraction) = (NuI19) -> AG (!((NuInteraction) = (NuI1)|(NuInteraction) = (NuI7))))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Second Template case', function () {
      // Type 2: <action> can happen only after <action>
      it('withdraw can happen only after finish', function () {
        const properties = [[['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateSecondTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- A [ !((NuInteraction) = (NuI3)) U ((NuInteraction) = (NuI19))]\nCTLSPEC A [ !((NuInteraction) = (NuI3)) U ((NuInteraction) = (NuI19))]\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // start#withdraw#finish
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If start happens, withdraw can only happen after finish happens', function () {
        const properties = [[['start'], ['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateThirdTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG (start) -> AX A [ !(withdraw) U (finish)]\nCTLSPEC AG (((NuInteraction) = (NuI1)) -> AX A [ !((NuInteraction) = (NuI3)) U ((NuInteraction) = (NuI19))])\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Fourth Template case', function () {
      // Type 4: <action> will eventually happen after <action> happens
      it('Finish will eventually happen after start happens', function () {
        const properties = [[['finish'], ['start']]]

        const generatedProperties = CTL.generateFourthTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '-- AG ((start) -> AF (finish))\nCTLSPEC AG (((NuInteraction) = (NuI1)) -> AF ((NuInteraction) = (NuI19)))\n\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
  })
  context('#generatingCTLPropertiesTxt', function () {
    context('First Template case', function () {
      // close#finish
      // Type 1: <action> cannot happen after <action>"
      it('bid cannot happen after finish', function () {
        const properties = [[['bid'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties)
        const expected = '(bid) cannot happen after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
      it('start or bid cannot happen after finish', function () {
        const properties = [[['start', 'bid'], ['finish']]]

        const generatedProperties = CTL.generateFirstTemplatePropertiesTxt(properties)
        const expected = '(start|bid) cannot happen after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Second Template case', function () {
      // finish#reveal
      // Type 2: <action> can happen only after <action>
      it('withdraw can happen only after finish', function () {
        const properties = [[['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateSecondTemplatePropertiesTxt(properties)
        const expected = '(withdraw) can happen only after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // start#withdraw#finish
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If start happens, withdraw can happen only after finish happens', function () {
        const properties = [[['start'], ['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateThirdTemplatePropertiesTxt(properties)
        const expected = 'If (start) happens, (withdraw) can happen only after (finish) happens\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Fourth Template case', function () {
      // finish#start
      // Type 4: <action> will eventually happen after <action> happens
      it('finish will eventually happen after finish', function () {
        const properties = [[['finish'], ['start']]]

        const generatedProperties = CTL.generateFourthTemplatePropertiesTxt(properties)
        const expected = '(finish) will eventually happen after (finish)\n'

        expect(generatedProperties).to.eql(expected)
      })
    })
  })
  context('#generatingCTLFairnessProperties', function () {
    context('Second Template case', function () {
      // Type 2: <action> can happen only after <action>
      it('withdraw can happen only after finish', function () {
        const properties = [[['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateSecondTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '(NuInteraction) = (NuI3)|'

        expect(generatedProperties).to.eql(expected)
      })
    })
    context('Third Template case', function () {
      // start#withdraw#finish
      // Type 3: If <action> happens, <action> can happen only after <action> happens
      it('If start happens, withdraw can happen only after finish happens', function () {
        const properties = [[['start'], ['withdraw'], ['finish']]]

        const generatedProperties = CTL.generateThirdTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
        const expected = '(NuInteraction) = (NuI19)|'

        expect(generatedProperties).to.eql(expected)
      })
    })
  })
  
  context('#parsingProperties', function () {
    const auctionModel = { name: 'auction', states: [ 'AB', 'F', 'C', 'start', 'withdraw', 's5_1', 's5_2', 'bid', 's8_1', 's8_2', 's8_3', 's8_4', 's8_5', 's8_6', 's8_7', 's15_T', 's16_1', 'finish', 's18_1', 'create', 's20_1' ], transitions: [ { name: 'astart_guard', actionName: 'start', src: 'C', dst: 'start', guards: 'exists<Auction<Currency>>(auction_addr)', input: 'auction_addr: address', output: '', statements: '', tags: '' }, { name: 'a1', src: 'start', dst: 'AB', guards: '', input: '', output: '', statements: '', tags: '' }, { name: 'awithdraw_guard', actionName: 'withdraw', src: 'F', dst: 'withdraw', guards: '', input: 'auction_owner_addr: address, bidder_addr: address', output: '', statements: '', tags: '' }, { name: 'a3', actionName: 'withdraw.let Auction {     \n\tbid,     \n    bidder: _,     \n    start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr);', src: 'withdraw', dst: 's5_1', guards: '', input: '', output: '', statements: 'let Auction {     \n\tbid,     \n    bidder: _,     \n    start_at: _, } = move_from<Auction<Currency>>(auction_owner_addr);', tags: '' }, { name: 'a4', actionName: 'withdraw.let bid_amount = Diem::value(&bid);', src: 's5_1', dst: 's5_2', guards: '', input: '', output: '', statements: 'let bid_amount = Diem::value(&bid);', tags: '' }, { name: 'a5', actionName: 'withdraw.DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b"", b"");', src: 's5_2', dst: 'F', guards: '', input: '', output: '', statements: 'DiemAccount::deposit(bidder_addr, auction_owner_addr, bid, b"", b"");', tags: '' }, { name: 'abid_guard', actionName: 'bid', src: 'AB', dst: 'bid', guards: '', input: 'bidder_addr: address, auction_owner_addr: address, bid: Diem<Currency>', output: '', statements: '', tags: '' }, { name: 'a7', actionName: 'bid.let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);', src: 'bid', dst: 's8_1', guards: '', input: '', output: '', statements: 'let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);', tags: '' }, { name: 'a8', actionName: 'bid.let bid_amt = Diem::value(&bid);', src: 's8_1', dst: 's8_2', guards: '', input: '', output: '', statements: 'let bid_amt = Diem::value(&bid);', tags: '' }, { name: 'a9', actionName: 'bid.let max_bid = Diem::value(&auction.max_bid);', src: 's8_2', dst: 's8_3', guards: '', input: '', output: '', statements: 'let max_bid = Diem::value(&auction.max_bid);', tags: '' }, { name: 'a10', actionName: 'bid.assert(bid_amt > max_bid, 1);', src: 's8_3', dst: 's8_4', guards: '', input: '', output: '', statements: 'assert(bid_amt > max_bid, 1);', tags: '' }, { name: 'a11', actionName: 'bid.assert(bidder_addr != auction.bidder, 1);', src: 's8_4', dst: 's8_5', guards: '', input: '', output: '', statements: 'assert(bidder_addr != auction.bidder, 1);', tags: '' }, { name: 'a12', src: 's8_5', dst: 's15_T', guards: 'max_bid > 0', input: '', output: '', statements: '', tags: '' }, { name: 'a13', actionName: 'bid.let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid);', src: 's15_T', dst: 's16_1', guards: '', input: '', output: '', statements: 'let to_send_back = Diem::withdraw(&mut auction.max_bid, max_bid);', tags: '' }, { name: 'a14', actionName: 'bid.DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b"", b"");', src: 's16_1', dst: 's8_6', guards: '', input: '', output: '', statements: 'DiemAccount::deposit<Currency>(bidder_addr, auction.bidder, to_send_back, b"", b"");', tags: '' }, { name: 'a15', src: 's8_5', dst: 's8_6', guards: '!(max_bid > 0)', input: '', output: '', statements: '', tags: '' }, { name: 'a16', actionName: 'bid.Diem::deposit(&mut auction.max_bid, bid);', src: 's8_6', dst: 's8_7', guards: '', input: '', output: '', statements: 'Diem::deposit(&mut auction.max_bid, bid);', tags: '' }, { name: 'a17', actionName: 'bid.*auction.bidder = bidder_addr;', src: 's8_7', dst: 'AB', guards: '', input: '', output: '', statements: '*auction.bidder = bidder_addr;', tags: '' }, { name: 'afinish_guard', actionName: 'finish', src: 'AB', dst: 'finish', guards: '', input: 'auction_owner: address', output: '', statements: '', tags: '' }, { name: 'a19', actionName: 'finish.let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);', src: 'finish', dst: 's18_1', guards: '', input: '', output: '', statements: 'let auction = borrow_global_mut<Auction<Currency>>(auction_owner_addr);', tags: '' }, { name: 'a20', actionName: 'finish.assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());', src: 's18_1', dst: 'F', guards: '', input: '', output: '', statements: 'assert(auction.auction_start + 432000 == DiemTimestamp::now_seconds());', tags: '' }, { name: 'acreate_guard', actionName: 'create', src: 'C', dst: 'create', guards: '', input: 'auction_owner: &signer', output: '', statements: '', tags: '' }, { name: 'a22', actionName: 'create.let auction_owner_addr = Signer::address_of(auction_owner);', src: 'create', dst: 's20_1', guards: '', input: '', output: '', statements: 'let auction_owner_addr = Signer::address_of(auction_owner);', tags: '' }, { name: 'a23', actionName: 'create.move_to<Auction<Currency>>(auction_owner, T {     \n\t\t\t\t\t\t\t\t\t\t\t\tDiem::zero<Currency>(),     \n                                                auction_owner_addr,     \n                                                DiemTimestamp::now_seconds() \n                                             }\n                           );', src: 's20_1', dst: 'C', guards: '', input: '', output: '', statements: 'move_to<Auction<Currency>>(auction_owner, T {     \n\t\t\t\t\t\t\t\t\t\t\t\tDiem::zero<Currency>(),     \n                                                auction_owner_addr,     \n                                                DiemTimestamp::now_seconds() \n                                             }\n                           );', tags: '' } ], initialState: 'C', finalStates: [ 'F' ] }
      context('Parsing with template 1', function () {
        it('1 statement parsing', function () {
          const input = 'bid#finish'

          const parsedProperties = CTL.parseProperties(auctionModel, input)
          const expected = [[['bid'], ['finish']]]

          expect(parsedProperties).to.eql(expected)
        })
        it('2 statement parsing', function () {
          const input = 'start|bid#finish'

          const parsedProperties = CTL.parseProperties(auctionModel, input)
          const expected = [[['start', 'bid'], ['finish']]]

          expect(parsedProperties).to.eql(expected)
        })
      })
  })
})
