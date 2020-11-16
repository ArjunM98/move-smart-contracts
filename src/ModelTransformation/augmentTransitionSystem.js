define([
    'tree-sitter',
    '@movei/tree-sitter-move'
], function (Parser, MoveGrammer) {
    'use strict';

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

    var AugmentTransitionSystem = function() {
        this.parser = new Parser();
        this.parser.setLanguage(MoveGrammer);
    }

    AugmentTransitionSystem.prototype.constructor = AugmentTransitionSystem;

    AugmentTransitionSystem.prototype.augmentStatement = function (augmentedStates, augmentedTransitions, statement, src, dst, ret, originalName) {
        var self = this;
        const tree = parser.parse(statement)

        // empty action
        if (tree.rootNode.childCount == 0) {
            augmentedTransitions.push({
                'name': "a" + augmentedTransitions.length.toString(),
                'src': src,
                'dst': dst,
                'guards': "",
                'input': "",
                'output': "",
                'statements': "",
                'tags': ""
            });
        } else {
            // get the first node in tree structure
            let statementBody = tree.rootNode.firstChild;

            // base cases 
            if (ExpressionFormats.includes(statementBody.type)) {
                augmentedTransitions.push({
                    'name': "a" + augmentedTransitions.length.toString(),
                    'actionName': originalName + "." + statement,
                    'src': src,
                    'dst': dst,
                    'guards': "",
                    'input': "",
                    'output': "",
                    'statements': statement,
                    'tags': ""
                });
            } else if (statementBody.type == 'return_expression') {
                augmentedTransitions.push({
                    'name': "a" + augmentedTransitions.length.toString(),
                    'actionName': originalName + "." + statement,
                    'src': src,
                    'dst': ret,
                    'guards': "",
                    'input': "",
                    'output': "",
                    'statements': statement,
                    'tags': ""
                });
            // recurse on the following conditions
            } else if (statementBody.type == "block") {
                statementBody = statementBody.child(0);
                
                // extract all the children which do not fall under [";", "{", "}"]
                let nonSyntaxNodesInd = [];
                for(const ind in statementBody.children) {
                    if(statementBody.children[ind].constructor.name != "SyntaxNode")
                        nonSyntaxNodesInd.push(ind);
                }

                if(nonSyntaxNodesInd.length > 1) {
                    // add a state for each action
                    let state = "s"+augmentedStates.length.toString();
                    for (let i = 1; i < nonSyntaxNodesInd.length; i++)
                        augmentedStates.push(state + "_" + i);
                    // augment initial statement
                    AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                        statementBody[nonSyntaxNodesInd[0]].text, src, state + "_1", ret, originalName);
                    // augement all states except first and last
                    for (let i = 1; i < nonSyntaxNodesInd.length - 1; i++)
                        AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                            statementBody[nonSyntaxNodesInd[i]].text, state + "_" + i, state + "_" + (i + 1), ret, originalName);
                    // augment finial state 
                    AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                        statementBody[nonSyntaxNodesInd[nonSyntaxNodesInd.length - 1]].text, state + "_" + (nonSyntaxNodesInd.length - 1), dst, ret, originalName);
                } else if (nonSyntaxNodesInd == 1) {
                    AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                        statementBody[nonSyntaxNodesInd[0]].text, src, dst, ret, originalName);
                } else {
                    augmentedTransitions.push({
                        'name': "a" + augmentedTransitions.length.toString(),
                        'src': src,
                        'dst': dst,
                        'guards': "",
                        'input': "",
                        'output': "",
                        'statements': "",
                        'tags': ""
                    });
                }
            } else if (statementBody.type == 'if_expression') {
                // extract all the children which do not fall under [";", "{", "}"]
                let nonSyntaxNodesInd = [];
                for(const ind in statementBody.children) {
                    if(statementBody.children[ind].constructor.name != "SyntaxNode")
                        nonSyntaxNodesInd.push(ind);
                }
                // condition is the first child after the syntax nodes
                const condition = statementBody.child(nonSyntaxNodesInd[0]).text;
                let state = "s" + augmentedStates.length.toString();
                // true branch
                augmentedStates.push(state + "_T");
                augmentedTransitions.push({
                    'name': "a" + augmentedTransitions.length.toString(),
                    'src': src,
                    'dst': state + "_T",
                    'guards': condition,
                    'input': "",
                    'output': "",
                    'statements': "",
                    'tags': ""
                });
                // augment block of if condition
                AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                    statementBody.child(nonSyntaxNodesInd[1]).text, state + "_T", dst, ret, originalName);
                // no else/else if branch
                if (nonSyntaxNodesInd < 3) {
                    augmentedTransitions.push({
                        'name': "a" + augmentedTransitions.length.toString(),
                        'src': src,
                        'dst': dst,
                        'guards': "!(" + condition + ")",
                        'input': "",
                        'output': "",
                        'statements': "",
                        'tags': ""
                    });
                }
                // else/else if branch
                else {
                    augmentedStates.push(state + "_F");
                    augmentedTransitions.push({
                        'name': "a" + augmentedTransitions.length.toString(),
                        'src': src,
                        'dst': state + "_F",
                        'guards': "!(" + condition + ")",
                        'input': "",
                        'output': "",
                        'statements': "",
                        'tags': ""
                    });
                    AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                        statementBody.child(nonSyntaxNodesInd[2]).text, state + "_F", dst, ret, originalName);
                }
            } else if (statementBody.type == 'while_expression') {
                let state = "s" + augmentedStates.length.toString();
                // extract all the children which do not fall under [";", "{", "}"]
                let nonSyntaxNodesInd = [];
                for(const ind in statementBody.children) {
                    if(statementBody.children[ind].constructor.name != "SyntaxNode")
                        nonSyntaxNodesInd.push(ind);
                }
                // condition is the first child after the syntax nodes
                let condition = statementBody.child(nonSyntaxNodesInd[0]).text;
                augmentedStates.push(state + "_L");
                augmentedTransitions.push({
                    'name': "a" + augmentedTransitions.length.toString(),
                    'src': src,
                    'dst': dst,
                    'guards': "!(" + condition + ")",
                    'input': "",
                    'output': "",
                    'statements': "",
                    'tags': ""
                });
                augmentedTransitions.push({
                    'name': "a" + augmentedTransitions.length.toString(),
                    'src': src,
                    'dst': state + "_L",
                    'guards': condition,
                    'input': "",
                    'output': "",
                    'statements': "",
                    'tags': ""
                });
                AugmentTransitionSystem.prototype.augmentStatement.call(self, augmentedStates, augmentedTransitions,
                    statementBody.child(nonSyntaxNodesInd[1]).text, state + "_L", src, ret, originalName);
            } 
            else {
                console.log(statementBody.child(0).type)
                throw "Unsupported statement type!";
            }
        }
    }
});