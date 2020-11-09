// This file was configured by VeriSolid found at https://github.com/VeriSolid/smart-contracts

// This file is automatically generated from the webgme-setup-tool.
'use strict';


var config = require('webgme/config/config.default'),
    validateConfig = require('webgme/config/validator');

// The paths can be loaded from the webgme-setup.json
config.seedProjects.basePaths.push(__dirname + '/../src/seeds/SC');


config.visualization.panelPaths.push(__dirname + '/../src/visualizers/panels');




// Visualizer descriptors
config.visualization.visualizerDescriptors.push(__dirname + '/../src/visualizers/Visualizers.json');

// Add requirejs paths
config.requirejsPaths = {
  'panels': './src/visualizers/panels',
  'widgets': './src/visualizers/widgets',
  'move-smart-contracts': './src/common'
};

config.mongo.uri = 'mongodb://127.0.0.1:27017/move-smart-contracts';
validateConfig(config);
module.exports = config;
