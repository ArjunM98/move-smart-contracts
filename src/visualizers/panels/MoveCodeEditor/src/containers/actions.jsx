export const setActiveNode = activeNode => ({
    type: 'SET_ACTIVE_NODE',
    activeNode,
});

export const setActiveSelection = activeSelection => ({
    type: 'SET_ACTIVE_SELECTION',
    activeSelection,
});


export const setReadOnly = readOnly => ({
    type: 'SET_READ_ONLY',
    readOnly,
});

export const setIsActivePanel = isActivePanel => ({
    type: 'SET_IS_ACTIVE_PANEL',
    isActivePanel,
});

export const setPanelSize = panelSize => ({
    type: 'SET_PANEL_SIZE',
    panelSize,
});
