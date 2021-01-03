// This file was configured by pmeijer found at https://github.com/pmeijer/webgme-react-viz

'use strict'
process.chdir(__dirname)

const gmeConfig = require('./config')
const webgme = require('webgme')

webgme.addToRequireJsPaths(gmeConfig)

const myServer = new webgme.standaloneServer(gmeConfig)
myServer.start()
