/* globals define */
/* eslint-env node, browser */

/**
 * Generated by PluginGenerator 2.20.5 from webgme on Sat Nov 28 2020 18:00:45 GMT-0500 (Eastern Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
  'plugin/PluginConfig',
  'text!./metadata.json',
  'plugin/PluginBase',
  'scsrc/ModelTransformation/augmentTransitionSystem',
  'scsrc/CTLTransformation/CTLProperties',
  'scsrc/BIPTemplates/ejsCache',
  'common/util/guid',
  'ejs'
], function (
  PluginConfig,
  pluginMetadata,
  PluginBase,
  AugmentTransitionSystem,
  CTLProperties,
  ejsCache,
  guid,
  ejs) {
  'use strict'

  pluginMetadata = JSON.parse(pluginMetadata)

  /**
     * Initializes a new instance of VerifyContract.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin VerifyContract.
     * @constructor
     */
  function VerifyContract () {
    // Call base class' constructor.
    PluginBase.call(this)
    this.pluginMetadata = pluginMetadata
    this.AugmentTransitionSystem = new AugmentTransitionSystem()
    this.CTLProperties = new CTLProperties()
  }

  /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructure etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
  VerifyContract.metadata = pluginMetadata

  // Prototypical inheritance from PluginBase.
  VerifyContract.prototype = Object.create(PluginBase.prototype)
  VerifyContract.prototype.constructor = VerifyContract

  /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
  VerifyContract.prototype.main = function (callback) {
    // Use this to access core, project, result, logger etc from PluginBase.
    const self = this
    let path
    let fs
    const filesToAdd = {}
    let artifact

    if (typeof window === 'undefined') {
      // Get current working directory
      path = process.cwd()
      // file system library
      fs = require('fs')
      // define projectOutputs directory
      if (!fs.existsSync('projectOutputs')) {
        fs.mkdirSync('projectOutputs')
      }
      // define path for where verfification files will be placed
      path += '/projectOutputs/' + self.core.getAttribute(self.activeNode, 'name') + guid()
      path = path.replace(/\s+/g, '')
    }

    // Loads all the nodes in the subtree starting from node and returns a map from paths to nodes.
    self.loadNodeMap(self.activeNode).then(function (nodes) {
      return VerifyContract.getVerificationResults(self, nodes, fs, path)
    }).then(function () {
      // writes verification output to the blob storage used (monogdb)
      filesToAdd['output.txt'] = fs.readFileSync(path + '/output.txt_translated.txt', 'utf8')
      artifact = self.blobClient.createArtifact('VerificationOutput')
      return artifact.addFiles(filesToAdd)
    }).then(function (fileHash) {
      self.result.addArtifact(fileHash)
      return artifact.save()
    }).then(function () {
      self.result.setSuccess(true)
      callback(null, self.result)
    }).catch(function (err) {
      self.logger.error(err)
      self.logger.error(err.stack)
      callback(err, self.result)
    })
  }

  /**
     * Verification function which invokes verify on each set of contracts
     * @param self - Reference to self object
     * @param nodes - Current node structure of modelling elements in project tree
     * @param fs - file system
     * @param path - path to write output files to
     */
  VerifyContract.getVerificationResults = function (self, nodes, fs, path) {
    let contract
    // for multiple contracts, verify each one
    for (contract of VerifyContract.prototype.getContractPaths.call(self, nodes)) { VerifyContract.prototype.verifyContract.call(self, nodes, contract, fs, path) }
  }

  /**
     * Get's contract path based on the node structure
     * @param nodes - Current node structure of modelling elements in project tree
     */
  VerifyContract.prototype.getContractPaths = function (nodes) {
    const self = this
    let path
    let node
    // Using an array for the multiple contracts extention
    const contracts = []

    for (path in nodes) {
      node = nodes[path]
      if (self.isMetaTypeOf(node, self.META.Contract)) {
        contracts.push(path)
      }
    }
    return contracts
  }

  /**
     *
     * @param nodes - Current node structure of modelling elements in project tree
     * @param contract - path to current contract node
     * @param fs - file system
     * @param path - path to write output files to
     */
  VerifyContract.prototype.verifyContract = function (nodes, contract, fs, path) {
    const self = this

    // If current verification tool nuXmv has not been downloaded, process cannot complete
    if (!fs.existsSync('./verificationTools/nuXmv')) {
      throw new Error('The NuSMV tool was not added. Please follow the instructions of the README file to add the NuSMV tool.')
    }

    // Build model structure
    let model = VerifyContract.prototype.buildModel.call(self, nodes, contract)

    // Augment Model
    model = self.AugmentTransitionSystem.augmentModel(model)
    // BIP model transformation
    const bipModel = ejs.render(ejsCache.contractType.complete, model)

    const execSync = require('child_process').execSync
    if (fs && path) {
      try {
        fs.statSync(path)
      } catch (err) {
        if (err.code === 'ENOENT') {
          fs.mkdirSync(path)
        }
      }

      // Generating NuSMV format form BIP
      fs.writeFileSync(path + '/' + model.name + '.bip', bipModel, 'utf8')
      const runbip2smv = 'java -jar ' + process.cwd() + '/verificationTools/bip-to-nusmv.jar ' + path + '/' + model.name + '.bip ' + path + '/' + model.name + '.smv'

      fs.writeFileSync(path + '/runbip2smv.sh', runbip2smv, 'utf8')
      self.sendNotification('Starting the BIP to NuSMV translation.')
      try {
        execSync('/bin/bash ' + path + '/runbip2smv.sh')
      } catch (e) {
        self.logger.error('stderr ' + e.stderr)
        throw e
      }
      self.sendNotification('BIP to NuSMV translation successful.')

      // To-Do: Can refactor generateProperties entirely to directly generate properties from ctlProperties attribute
      // In spirit of moving fast, we create a PluginConfig object based on the ctlProperties attribute to minimize
      // changes to existing logic as implemented in VeriSolid
      const currentConfig = VerifyContract.prototype.createPluginConfig.call(self, nodes, contract)

      // Generate CTL properties
      VerifyContract.prototype.generateProperties.call(self, fs, path, model, currentConfig)

      //  Run NuSMV Verification
      let runNusmv = ''
      runNusmv = '.' + '/verificationTools/nuXmv -r ' + path + '/' + model.name + '.smv >> ' + path + '/output.txt'

      fs.writeFileSync(path + '/runNusmv.sh', runNusmv, 'utf8')
      self.sendNotification('Starting the NuSMV verification..')
      try {
        execSync('/bin/bash ' + path + '/runNusmv.sh')
      } catch (e) {
        self.logger.error('stderr ' + e.stderr)
        throw e
      }
      self.sendNotification('NuSMV verification successful.')

      // Generate counter examples
      const runsmv2bip = 'java -jar ' + process.cwd() + '/verificationTools/smv2bip.jar ' + path + '/' + model.name + '.smv ' + path + '/output.txt ' + path + '/' + model.name + 'Prop.txt'

      fs.writeFileSync(path + '/runsmv2bip.sh', runsmv2bip, 'utf8')
      self.sendNotification('Starting the NuSMV to BIP counterexamples translation..')
      try {
        execSync('/bin/bash ' + path + '/runsmv2bip.sh')
      } catch (e) {
        self.logger.error('stderr ' + e.stderr)
        throw e
      }
      self.sendNotification('NuSMV to BIP counterexamples translation successful.')
    }
  }

  VerifyContract.prototype.createPluginConfig = function (nodes, contract) {
    const self = this
    const node = nodes[contract]
    let ctlProperties = self.core.getAttribute(node, 'ctlProperties')

    // No CTL Properties specified
    // Assumes that ctlProperties input is relatively "good" because it SHOULD be modified only through visualizer
    if (
      ctlProperties === undefined ||
      ctlProperties === null ||
      (ctlProperties.typeOne.length === 0 && ctlProperties.typeTwo.length === 0 && ctlProperties.typeThree.length === 0 && ctlProperties.typeFour.length === 0)
    ) {
      ctlProperties = {
        typeOne: [],
        typeTwo: [],
        typeThree: [],
        typeFour: []
      }
      self.sendNotification({
        message: 'Verification running with no specified CTL properties. Add properties through the Verification Properties Visualizer on individual contracts.',
        severity: 'warn'
      })
    }

    const { typeOne, typeTwo, typeThree, typeFour } = ctlProperties

    const makeTemplate = function (type) {
      let template = ''

      type.forEach((rule) => {
        // Not first rule
        if (template !== '') {
          template = template + ';'
        }

        const numberOfActions = Object.keys(rule).length

        for (let i = 0; i < numberOfActions; i++) {
          template = template + rule[i]

          // Not last action
          if (i !== (numberOfActions - 1)) {
            template = template + '#'
          }
        }
      })

      return template
    }

    const config = {
      templateOne: makeTemplate(typeOne),
      templateTwo: makeTemplate(typeTwo),
      templateThree: makeTemplate(typeThree),
      templateFour: makeTemplate(typeFour)
    }

    return new PluginConfig(config)
  }

  VerifyContract.prototype.generateProperties = function (fs, path, model, currentConfig) {
    const self = this
    let actionNamesToTransitionNames = {}
    let bipTransitionsToSMVNames = {}

    actionNamesToTransitionNames = VerifyContract.prototype.actionNamesToTransitions.call(self, model.transitions, actionNamesToTransitionNames)
    bipTransitionsToSMVNames = VerifyContract.prototype.BIPTransitionSMVNames.call(self, fs, path, model)

    let fairnessProperties = ''
    if (currentConfig.templateTwo !== '' || currentConfig.templateThree !== '') {
      fairnessProperties = 'FAIRNESS ( '
    }
    let propertiesSMV = ''
    let propertiesTxt = ''
    let properties = []
    if (currentConfig.templateOne !== '') {
      properties = self.CTLProperties.parseProperties(model, currentConfig.templateOne)
      propertiesSMV += self.CTLProperties.generateFirstTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      propertiesTxt += self.CTLProperties.generateFirstTemplatePropertiesTxt(properties)
    }
    if (currentConfig.templateTwo !== '') {
      properties = self.CTLProperties.parseProperties(model, currentConfig.templateTwo)
      propertiesSMV += self.CTLProperties.generateSecondTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      fairnessProperties += self.CTLProperties.generateSecondTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      propertiesTxt += self.CTLProperties.generateSecondTemplatePropertiesTxt(properties)
    }
    if (currentConfig.templateThree !== '') {
      properties = self.CTLProperties.parseProperties(model, currentConfig.templateThree)
      propertiesSMV += self.CTLProperties.generateThirdTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      fairnessProperties += self.CTLProperties.generateThirdTemplateFairnessProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      propertiesTxt += self.CTLProperties.generateThirdTemplatePropertiesTxt(properties)
    }
    if (currentConfig.templateFour !== '') {
      properties = self.CTLProperties.parseProperties(model, currentConfig.templateFour)
      propertiesSMV += self.CTLProperties.generateFourthTemplateProperties(bipTransitionsToSMVNames, actionNamesToTransitionNames, properties)
      propertiesTxt += self.CTLProperties.generateFourthTemplatePropertiesTxt(properties)
    }
    if (currentConfig.templateTwo !== '' || currentConfig.templateThree !== '') {
      fairnessProperties = fairnessProperties.slice(0, -1)
      fairnessProperties += ');'
    }
    fs.appendFileSync(path + '/' + model.name + '.smv', propertiesSMV)
    fs.appendFileSync(path + '/' + model.name + '.smv', fairnessProperties)
    fs.writeFileSync(path + '/' + model.name + 'Prop.txt', propertiesTxt)
  }

  /**
     *
     * Helper function to generate mappings from action names to regular names
     *
     * @param transitions - Object array of all transitions
     * @param actionNamesToTransitionNames - Populate with a map of actionNames to names
     */
  VerifyContract.prototype.actionNamesToTransitions = function (transitions, actionNamesToTransitionNames) {
    for (const transition of transitions) {
      if (transition.actionName !== undefined) {
        actionNamesToTransitionNames[transition.actionName] = transition.name
      }
    }
    return actionNamesToTransitionNames
  }

  /**
     *
     * Helper function to generate mappings from NuSMV names to BIP names
     *
     * @param fs - file system import
     * @param path - project path for where files are stored
     * @param model - object describing contract structure
     */
  VerifyContract.prototype.BIPTransitionSMVNames = function (fs, path, model) {
    let inINVAR = false
    let inModuleMain = false
    const bipTransitionsToSMVNames = {}

    // Building mapping of BIP names to NuSMV name
    for (const line of fs.readFileSync(path + '/' + model.name + '.smv', 'utf-8').split('\n')) {
      if (line.includes('INVAR') && inModuleMain) {
        inINVAR = true
      } else if (line.includes('MODULE main')) {
        inModuleMain = true
        // Find main module where NuSMV names are defined
        // Index into pre-defined format of:
        // ( (( (NuInteraction) = (NuI15) )) -> (BAUC_a14) )
      } else if (inModuleMain && inINVAR) {
        if (line.includes('Nu')) {
          const fields = line.split(/\(|\)/)
          bipTransitionsToSMVNames[fields[10].substring(5)] = '(NuInteraction) = (' + fields[6] + ')'
        }
      }
    }
    return bipTransitionsToSMVNames
  }

  /**
     *
     * Given node structure and specified contract, builds the main model structure
     *
     * @param nodes - Current node structure of modelling elements in project tree
     * @param contract - path to current contract node
     */
  VerifyContract.prototype.buildModel = function (nodes, contract) {
    const self = this

    // extract contract specific nodes
    const node = nodes[contract]
    const name = self.core.getAttribute(node, 'name')

    // get path of each child node from contract main node
    const pathToName = {}
    for (const childPath of self.core.getChildrenPaths(node)) {
      pathToName[childPath] = self.core.getAttribute(nodes[childPath], 'name')
    }

    const states = []
    const transitions = []
    const finalStates = []
    let initialState

    // Building model object attributes
    for (const childPath of self.core.getChildrenPaths(node)) {
      const child = nodes[childPath]
      const childName = self.core.getAttribute(child, 'name')

      if (self.isMetaTypeOf(child, self.META.State)) {
        states.push(childName)
      } else if (self.isMetaTypeOf(child, self.META.InitialState)) {
        states.push(childName)
        initialState = childName
      } else if (self.isMetaTypeOf(child, self.META.FinalState)) {
        states.push(childName)
        finalStates.push(childName)
      } else if (self.isMetaTypeOf(child, self.META.Transition) || self.isMetaTypeOf(child, self.META.CreateTransition)) {
        const transition = {
          name: childName,
          src: pathToName[self.core.getPointerPath(child, 'src')],
          dst: pathToName[self.core.getPointerPath(child, 'dst')],
          guards: self.core.getAttribute(child, 'guards'),
          input: self.core.getAttribute(child, 'input'),
          output: self.core.getAttribute(child, 'output'),
          statements: self.core.getAttribute(child, 'statements'),
          tags: self.core.getAttribute(child, 'tags')
        }
        transitions.push(transition)
      }
    }

    // Complete model object built from nodes
    return {
      name: name,
      states: states,
      transitions: transitions,
      initialState: initialState,
      finalStates: finalStates
    }
  }

  return VerifyContract
})
