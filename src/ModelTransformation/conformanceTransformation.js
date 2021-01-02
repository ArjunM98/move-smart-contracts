define([], function () {
    return function (model) {
        var states = [];
        for (const state of model['states'])
            states.push(state);

        var transitions = [],
            initialState = model['initialState'];
        for (const transition of model['transitions'])
            transitions.push(transition);

        if (model['initialAction'].trim().length != 0) {
            states.push("pre_constructor");
            initialState = "pre_constructor";
            transitions.push({
                'name': model['name'],
                'src': "pre_constructor",
                'dst': model['initialState'],
                'guards': "",
                'input': "",
                'output': "",
                'statements': model['initialAction'],
                'tags': ""
            });
        }

        return {
            'name': model['name'],
            'states': states,
            'transitions': transitions,
            'initialState': initialState,
            'finalStates': model['finalStates']
        };
    }
});

