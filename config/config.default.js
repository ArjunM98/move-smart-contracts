// This file was configured by VeriSolid found at https://github.com/VeriSolid/smart-contracts

'use strict'

const config = require('./config.webgme')
const validateConfig = require('webgme/config/validator')

config.requirejsPaths.scsrc = './src'
config.plugin.allowServerExecution = true
config.client.defaultConnectionRouter = 'basic'
validateConfig(config)
module.exports = config
