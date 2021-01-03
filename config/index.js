// This file was configured by pmeijer found at https://github.com/pmeijer/webgme-react-viz

'use strict'

const env = process.env.NODE_ENV || 'default'
const configFilename = __dirname + '/config.' + env + '.js' /* eslint node/no-path-concat: "off" */
const config = require(configFilename)
const validateConfig = require('webgme/config/validator')

validateConfig(configFilename)
module.exports = config
