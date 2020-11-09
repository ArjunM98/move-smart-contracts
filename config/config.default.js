// This file was configured by VeriSolid found at https://github.com/VeriSolid/smart-contracts

'use strict';

var config = require('./config.webgme'),
    path = require('path'),
    validateConfig = require('webgme/config/validator');

config.requirejsPaths['scsrc'] = './src';
config.visualization.svgDirs.push(path.join(__dirname, '../src/svgs'));
config.seedProjects.defaultProject = 'SC';
config.plugin.allowServerExecution = true;
config.client.defaultConnectionRouter = 'basic';
validateConfig(config);
module.exports = config;
