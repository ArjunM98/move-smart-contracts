define([
  'tree-sitter',
  '@movei/tree-sitter-move'
], function (Parser, MoveGrammer) {
  'use strict'

  const ExpressionFormats = [
    'binary_expression',
    'assign_expression',
    'call_expression',
    'break_expression',
    'continue_expression',
    'move_or_copy_expression',
    'cast_expression',
    'let_statement'
  ]

  const AugmentTransitionSystem = function () {
    this.parser = new Parser()
    this.parser.setLanguage(MoveGrammer)
  }

  AugmentTransitionSystem.prototype.constructor = AugmentTransitionSystem

  // Transforms model to only using variable declarations, expression statements, and return statements
  // Algorithm 3 from VeriSolid whitepaper
  AugmentTransitionSystem.prototype.augmentModel = function (model) {
    const self = this
    const augmentedStates = []
    const augmentedTransitions = []

    // Copy over base states
    for (const state of model.states) {
      augmentedStates.push(state)
    }

    // Process each transition
    // To-Do: Consider adding revert flow once investigating if it is needed
    for (const transition of model.transitions) {
      // Add state s_guard
      const s_guard = transition.name /* eslint camelcase: "off" */
      augmentedStates.push(s_guard)

      // Add transition from src state to s_guard with the original transition's guards
      augmentedTransitions.push({
        name: 'a' + s_guard + '_guard', /* eslint camelcase: "off" */
        actionName: s_guard,
        src: transition.src,
        dst: s_guard,
        guards: transition.guards,
        input: transition.input,
        output: transition.output,
        statements: '',
        tags: transition.tags
      })

      // Wrap the statement in braces because we want augmentStatement to initially treat every statement as a block statement
      // This is because we want to process compound statements (2 or more statements) as block statements
      const statement = '{' + transition.statements + '};'

      // AugmentStatement for a transition from s_guard to original dst
      AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
        statement, s_guard, transition.dst, transition.dst, s_guard)
    }

    return {
      name: model.name,
      states: augmentedStates,
      transitions: augmentedTransitions,
      initialState: model.initialState,
      finalStates: model.finalStates
    }
  }

  // Transforms a single transition as states and transitions using only variable declarations, expression statements, and return statements
  // Algorithm 2 from VeriSolid whitepaper
  AugmentTransitionSystem.prototype.augmentStatement = function (augmentedStates, augmentedTransitions, statement, src, dst, ret, originalName) {
    const self = this
    const tree = self.parser.parse(statement)

    // empty action
    if (tree.rootNode.childCount === 0) {
      augmentedTransitions.push({
        name: 'a' + augmentedTransitions.length.toString(),
        src: src,
        dst: dst,
        guards: '',
        input: '',
        output: '',
        statements: '',
        tags: ''
      })
    } else {
      // get the first node in tree structure
      const statementBody = tree.rootNode.firstChild

      // base cases
      if (ExpressionFormats.includes(statementBody.type)) {
        augmentedTransitions.push({
          name: 'a' + augmentedTransitions.length.toString(),
          actionName: originalName + '.' + statement,
          src: src,
          dst: dst,
          guards: '',
          input: '',
          output: '',
          statements: statement,
          tags: ''
        })
      } else if (statementBody.type === 'return_expression') {
        augmentedTransitions.push({
          name: 'a' + augmentedTransitions.length.toString(),
          actionName: originalName + '.' + statement,
          src: src,
          dst: ret,
          guards: '',
          input: '',
          output: '',
          statements: statement,
          tags: ''
        })
        // recurse on the following conditions
      } else if (statementBody.type === 'block') {
        // extract all the children which do not fall under [";", "{", "}"]
        const nonSyntaxNodesInd = []

        for (const ind in statementBody.children) {
          if (statementBody.children[ind].constructor.name !== 'SyntaxNode') { nonSyntaxNodesInd.push(parseInt(ind)) }
        }

        if (nonSyntaxNodesInd.length > 1) {
          // add a state for each action
          const state = 's' + augmentedStates.length.toString()
          for (let i = 1; i < nonSyntaxNodesInd.length; i++) { augmentedStates.push(state + '_' + i) }
          // augment initial statement
          AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
            statementBody.child(nonSyntaxNodesInd[0]).text + ';', src, state + '_1', ret, originalName)
          // augment all states except first and last
          for (let i = 1; i < nonSyntaxNodesInd.length - 1; i++) {
            AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
              statementBody.child(nonSyntaxNodesInd[i]).text + ';', state + '_' + i, state + '_' + (i + 1), ret, originalName)
          }
          // augment finial state
          AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
            statementBody.child(nonSyntaxNodesInd[nonSyntaxNodesInd.length - 1]).text + ';', state + '_' + (nonSyntaxNodesInd.length - 1), dst, ret, originalName)
        } else if (nonSyntaxNodesInd.length === 1) {
          AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
            statementBody.child(nonSyntaxNodesInd[0]).text + ';', src, dst, ret, originalName)
        } else {
          augmentedTransitions.push({
            name: 'a' + augmentedTransitions.length.toString(),
            src: src,
            dst: dst,
            guards: '',
            input: '',
            output: '',
            statements: '',
            tags: ''
          })
        }
      } else if (statementBody.type === 'if_expression') {
        // extract all the children which do not fall under [";", "{", "}"]
        const nonSyntaxNodesInd = []

        for (const ind in statementBody.children) {
          if (statementBody.children[ind].constructor.name !== 'SyntaxNode') { nonSyntaxNodesInd.push(parseInt(ind)) }
        }

        // condition is the first child after the syntax nodes
        const condition = statementBody.child(nonSyntaxNodesInd[0]).text

        const state = 's' + augmentedStates.length.toString()
        // true branch
        augmentedStates.push(state + '_T')
        augmentedTransitions.push({
          name: 'a' + augmentedTransitions.length.toString(),
          src: src,
          dst: state + '_T',
          guards: condition,
          input: '',
          output: '',
          statements: '',
          tags: ''
        })

        // augment block of if condition
        AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
          statementBody.child(nonSyntaxNodesInd[1]).text + ';', state + '_T', dst, ret, originalName)

        // no else/else if branch
        if (nonSyntaxNodesInd.length < 3) {
          augmentedTransitions.push({
            name: 'a' + augmentedTransitions.length.toString(),
            src: src,
            dst: dst,
            guards: '!(' + condition + ')',
            input: '',
            output: '',
            statements: '',
            tags: ''
          })
        } /* eslint brace-style: "off" */
        // else/else if branch
        else {
          augmentedStates.push(state + '_F')
          augmentedTransitions.push({
            name: 'a' + augmentedTransitions.length.toString(),
            src: src,
            dst: state + '_F',
            guards: '!(' + condition + ')',
            input: '',
            output: '',
            statements: '',
            tags: ''
          })
          AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
            statementBody.child(nonSyntaxNodesInd[2]).text, state + '_F', dst, ret, originalName)
        }
      } else if (statementBody.type === 'while_expression') {
        const state = 's' + augmentedStates.length.toString()
        // extract all the children which do not fall under [";", "{", "}"]
        const nonSyntaxNodesInd = []
        for (const ind in statementBody.children) {
          if (statementBody.children[ind].constructor.name !== 'SyntaxNode') { nonSyntaxNodesInd.push(parseInt(ind)) }
        }
        // condition is the first child after the syntax nodes
        const condition = statementBody.child(nonSyntaxNodesInd[0]).text
        augmentedStates.push(state + '_L')
        augmentedTransitions.push({
          name: 'a' + augmentedTransitions.length.toString(),
          src: src,
          dst: dst,
          guards: '!(' + condition + ')',
          input: '',
          output: '',
          statements: '',
          tags: ''
        })
        augmentedTransitions.push({
          name: 'a' + augmentedTransitions.length.toString(),
          src: src,
          dst: state + '_L',
          guards: condition,
          input: '',
          output: '',
          statements: '',
          tags: ''
        })
        AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
          statementBody.child(nonSyntaxNodesInd[1]).text, state + '_L', src, ret, originalName)
      } else {
        throw 'Unsupported statement type!' /* eslint no-throw-literal: "off" */
      }
    }
  }

  return AugmentTransitionSystem
})
