/**
 * This file is specific for the wrapper in webgme. Note how the VISUALIZER_INSTANCE_ID
 * is defined in the wrapper inside webpack.config.js and later passed by the MoveCodeEditorPanel.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactViz from './ReactViz';

window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].initialized = true;

window.WebGMEGlobal.WebGMEReactPanels[VISUALIZER_INSTANCE_ID].stateMediator.onDestroy = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById(VISUALIZER_INSTANCE_ID));
};

ReactDOM.render(
    <ReactViz />,
    document.getElementById(VISUALIZER_INSTANCE_ID),
);
