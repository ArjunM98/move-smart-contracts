var expect = require('chai').expect;
var requirejs = require('requirejs');
const AugmentTransitionSystem = requirejs("./src/ModelTransformation/augmentTransitionSystem.js");
const augment = new AugmentTransitionSystem;

describe('augmentTransitionSystem', function () {
    context('#augmentStatement', function () {
        context('general expressions case', function () {
            it('should properly augment states and transitions', function () {

                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'let b: u64 = 10;',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        actionName: 'random_transition.let b: u64 = 10;',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 10;',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })
        })

        context('return expression case', function () {
            it('should properly augment states and transitions', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'return b;',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        actionName: 'random_transition.return b;',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'return b;',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })
        })

        context('compound expression case', function () {
            it('should handle the case where there is zero statements', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: '{};',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })

            it('should handle the case where there is one statements', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: '{ let b: u64 = 10; };',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        actionName: 'random_transition.let b: u64 = 10;',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 10;',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })

            it('should handle the case where there is more than one statements', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: '{ let b: u64 = 10; let a: u64 = 10; let c: u64 = 10 };',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition', 's4_1', 's4_2'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        actionName: 'random_transition.let b: u64 = 10;',
                        src: 'random_transition',
                        dst: 's4_1',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 10;',
                        tags: ''
                    },
                    {
                        name: 'a2',
                        actionName: 'random_transition.let a: u64 = 10;',
                        src: 's4_1',
                        dst: 's4_2',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let a: u64 = 10;',
                        tags: ''
                    },
                    {
                        name: 'a3',
                        actionName: 'random_transition.let c: u64 = 10;',
                        src: 's4_2',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let c: u64 = 10;',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })
        })

        context('if expression case', function () {
            it('should handle the case where there is no alternate path', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'if (a > 5) { let b: u64 = 10; };',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition', 's4_T'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        src: 'random_transition',
                        dst: 's4_T',
                        guards: 'a > 5',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a2',
                        actionName: 'random_transition.let b: u64 = 10;',
                        src: 's4_T',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 10;',
                        tags: ''
                    },
                    {
                        name: 'a3',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '!(a > 5)',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })

            it('should handle the case where there is an alternate path', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'if (a > 5) { let b: u64 = 10; } else { let b: u64 = 5; };',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition', 's4_T', 's4_F'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        src: 'random_transition',
                        dst: 's4_T',
                        guards: 'a > 5',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a2',
                        actionName: 'random_transition.let b: u64 = 10;',
                        src: 's4_T',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 10;',
                        tags: ''
                    },
                    {
                        name: 'a3',
                        src: 'random_transition',
                        dst: 's4_F',
                        guards: '!(a > 5)',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a4',
                        actionName: 'random_transition.let b: u64 = 5;',
                        src: 's4_F',
                        dst: 'A',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'let b: u64 = 5;',
                        tags: ''
                    }
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })
        })

        context('while expression case', function () {
            it('should properly augment states and transitions', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'while (i < 5) { i = i + 1; };',
                    tags: ''
                }

                // Outputs
                const expectedAugmentedStates = ['A', 'B', 'C', 'random_transition', 's4_L'];
                const expectedAugmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        src: 'random_transition',
                        dst: 'A',
                        guards: '!(i < 5)',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a2',
                        src: 'random_transition',
                        dst: 's4_L',
                        guards: 'i < 5',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a3',
                        actionName: 'random_transition.i = i + 1;',
                        src: 's4_L',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'i = i + 1;',
                        tags: ''
                    }
                ];

                // Test
                augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name']);

                expect(augmentedStates).to.eql(expectedAugmentedStates);
                expect(augmentedTransitions).to.eql(expectedAugmentedTransitions);
            })
        })

        context('statement type unsupported case', function () {
            it('should throw an error', function () {
                // Inputs
                const augmentedStates = ['A', 'B', 'C', 'random_transition'];
                const augmentedTransitions = [
                    {
                        name: 'arandom_transition_guard',
                        actionName: 'random_transition',
                        src: 'A',
                        dst: 'random_transition',
                        guards: '',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    }
                ];

                const transition = {
                    name: 'random_transition',
                    src: 'A',
                    dst: 'A',
                    guards: '',
                    input: '',
                    output: '',
                    statements: 'loop { i = i + 1; };',
                    tags: ''
                }

                // Test
                expect(() => augment.augmentStatement(augmentedStates, augmentedTransitions,
                    transition['statements'], transition['name'], transition['dst'], transition['dst'], transition['name'])).to.throw();
            })
        })
    })

    context('#augmentModel', function () {
        it('should properly augment a model', function () {
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
                finalStates: ['C']
            };



            // Expect two additional statements to be created, one for each transition
            // Since all statements are "basic", we expect four transitions to be created
            const expectedAugmentedModel = {
                name: 'My Model',
                states: ['A', 'B', 'C', 'a_to_b', 'b_to_c'],
                transitions: [
                    {
                        name: 'aa_to_b_guard',
                        actionName: 'a_to_b',
                        src: 'A',
                        dst: 'a_to_b',
                        guards: 'canTransition == true',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a1',
                        actionName: 'a_to_b.step = step + 1;',
                        src: 'a_to_b',
                        dst: 'B',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'step = step + 1;',
                        tags: ''
                    },
                    {
                        name: 'ab_to_c_guard',
                        actionName: 'b_to_c',
                        src: 'B',
                        dst: 'b_to_c',
                        guards: 'cannotTransition == false',
                        input: '',
                        output: '',
                        statements: '',
                        tags: ''
                    },
                    {
                        name: 'a3',
                        actionName: 'b_to_c.step = step + 1;',
                        src: 'b_to_c',
                        dst: 'C',
                        guards: '',
                        input: '',
                        output: '',
                        statements: 'step = step + 1;',
                        tags: ''
                    },
                ],
                initialState: 'A',
                finalStates: ['C']
            };

            const resultModel = augment.augmentModel(inputModel);
            expect(resultModel).to.eql(expectedAugmentedModel);
        })
    })
})