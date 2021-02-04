/* globals VISUALIZER_INSTANCE_ID, window, document */
/**
 * This file is specific for the wrapper in webgme. Note how the VISUALIZER_INSTANCE_ID
 * is defined in the wrapper inside webpack.config.js and later passed by the WebGMEReactVizPanel.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import MoveCodeEditor from './MoveCodeEditor';

window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].initialized = true;

window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].stateMediator.onDestroy = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById(VISUALIZER_INSTANCE_ID));
};

ReactDOM.render(
    <MoveCodeEditor
        gmeClient={window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].client}
        stateMediator={window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].stateMediator}
        initialState={window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].initialState}
    />,
    document.getElementById(VISUALIZER_INSTANCE_ID),
);