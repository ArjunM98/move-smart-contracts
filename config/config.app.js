'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

config.client.appDir = './build';
// Add/overwrite any additional settings here
config.server.port = 8080;
config.mongo.uri = 'mongodb://127.0.0.1:27017/multi';

validateConfig(config);
module.exports = config;
