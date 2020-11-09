// This file was configured by pmeijer found at https://github.com/pmeijer/webgme-react-viz

'use strict';
process.chdir(__dirname);

let gmeConfig = require('./config'),
    webgme = require('webgme'),
    myServer;

webgme.addToRequireJsPaths(gmeConfig);

myServer = new webgme.standaloneServer(gmeConfig);
myServer.start(function () {
    //console.log('server up');
});
