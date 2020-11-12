import {combineReducers} from 'redux';
// import update from 'immutability-helper';

const activeNode = (state = null, action) => {
    if (action.type === 'SET_ACTIVE_NODE') {
        return action.activeNode;
    }

    return state;
};

const activeSelection = (state = [], action) => {
    if (action.type === 'SET_ACTIVE_SELECTION') {
        return action.activeSelection;
    }

    return state;
};

const readOnly = (state = false, action) => {
    if (action.type === 'SET_READ_ONLY') {
        return action.readOnly;
    }

    return state;
};

const isActivePanel = (state = false, action) => {
    if (action.type === 'SET_IS_ACTIVE_PANEL') {
        return action.isActivePanel;
    }

    return state;
};

const panelSize = (state = {width: 0, height: 0}, action) => {
    if (action.type === 'SET_PANEL_SIZE') {
        return action.panelSize;
    }

    return state;
};

export default combineReducers({
    // WebGMEGlobal State
    activeNode,
    activeSelection,

    // Panel events
    readOnly,
    isActivePanel,
    panelSize,
});
