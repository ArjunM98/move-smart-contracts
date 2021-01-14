/* eslint-env node, mocha */
/**
 * Generated by PluginGenerator 2.20.5 from webgme on Fri Jan 08 2021 11:25:57 GMT-0500 (Eastern Standard Time).
 */

describe('MoveCodeGenerator', function () {
  const testFixture = require('../../globals')
  const gmeConfig = testFixture.getGmeConfig()
  const expect = testFixture.expect
  const logger = testFixture.logger.fork('MoveCodeGenerator')
  const PluginCliManager = testFixture.WebGME.PluginCliManager
  const projectName = 'testProject'
  const pluginName = 'MoveCodeGenerator'
  let project
  let gmeAuth
  let storage
  let commitHash

  before(function (done) {
    testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName)
      .then(function (gmeAuth_) {
        gmeAuth = gmeAuth_
        // This uses in memory storage. Use testFixture.getMongoStorage to persist test to database.
        storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth)
        return storage.openDatabase()
      })
      .then(function () {
        const importParam = {
          projectSeed: testFixture.path.join(testFixture.SEED_DIR, 'EmptyProject.webgmex'),
          projectName: projectName,
          branchName: 'master',
          logger: logger,
          gmeConfig: gmeConfig
        }

        return testFixture.importProject(storage, importParam)
      })
      .then(function (importResult) {
        project = importResult.project
        commitHash = importResult.commitHash
        return project.createBranch('test', commitHash)
      })
      .nodeify(done)
  })

  after(function (done) {
    storage.closeDatabase()
      .then(function () {
        return gmeAuth.unload()
      })
      .nodeify(done)
  })

  it('should run plugin and update the branch', function (done) {
    const manager = new PluginCliManager(null, logger, gmeConfig)
    const pluginConfig = {
    }
    const context = {
      project: project,
      commitHash: commitHash,
      branchName: 'test',
      activeNode: '/1'
    }

    manager.executePlugin(pluginName, pluginConfig, context, function (err, pluginResult) {
      try {
        expect(err).to.equal(null)
        expect(typeof pluginResult).to.equal('object')
        expect(pluginResult.success).to.equal(true)
      } catch (e) {
        done(e)
        return
      }

      project.getBranchHash('test')
        .then(function (branchHash) {
          expect(branchHash).to.not.equal(commitHash)
        })
        .nodeify(done)
    })
  })
})
