const expect = require('chai').expect
const requirejs = require('requirejs')
const conformanceTransformation = requirejs('./src/ModelTransformation/conformanceTransformation.js')

describe('conformance', function () {
  context('initial action', function () {
    it('should properly handle no initial action', function () {
      const inputModel = {
        name: 'My Model',
        states: ['A', 'B', 'C'],
        transitions: [
          {
            name: 'a_to_b',
            src: 'A',
            dst: 'B',
            guards: 'canTransition == true',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          },
          {
            name: 'b_to_c',
            src: 'B',
            dst: 'C',
            guards: 'cannotTransition == false',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          }
        ],
        initialState: 'A',
        finalStates: ['C'],
        initialAction: ''
      }

      const expectedModel = {
        name: 'My Model',
        states: ['A', 'B', 'C'],
        transitions: [
          {
            name: 'a_to_b',
            src: 'A',
            dst: 'B',
            guards: 'canTransition == true',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          },
          {
            name: 'b_to_c',
            src: 'B',
            dst: 'C',
            guards: 'cannotTransition == false',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          }
        ],
        initialState: 'A',
        finalStates: ['C']
      }

      const resultModel = conformanceTransformation(inputModel)
      expect(resultModel).to.eql(expectedModel)
    })

    it('should properly handle initial action', function () {
      const inputModel = {
        name: 'My Model',
        states: ['A', 'B', 'C'],
        transitions: [
          {
            name: 'a_to_b',
            src: 'A',
            dst: 'B',
            guards: 'canTransition == true',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          },
          {
            name: 'b_to_c',
            src: 'B',
            dst: 'C',
            guards: 'cannotTransition == false',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          }
        ],
        initialState: 'A',
        finalStates: ['C'],
        initialAction: 'my initial action'
      }

      const expectedModel = {
        name: 'My Model',
        states: ['A', 'B', 'C', 'pre_constructor'],
        transitions: [
          {
            name: 'a_to_b',
            src: 'A',
            dst: 'B',
            guards: 'canTransition == true',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          },
          {
            name: 'b_to_c',
            src: 'B',
            dst: 'C',
            guards: 'cannotTransition == false',
            input: '',
            output: '',
            statements: 'step = step + 1',
            tags: ''
          },
          {
            name: 'My Model',
            src: 'pre_constructor',
            dst: 'A',
            guards: '',
            input: '',
            output: '',
            statements: 'my initial action',
            tags: ''
          }
        ],
        initialState: 'pre_constructor',
        finalStates: ['C']
      }

      const resultModel = conformanceTransformation(inputModel)
      expect(resultModel).to.eql(expectedModel)
    })
  })
})
