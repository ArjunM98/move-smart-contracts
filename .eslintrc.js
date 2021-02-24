module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:json/recommended'
  ],
  ignorePatterns: [
    '/src/visualizers/panels/ReactVisualizerBundles',
    '/src/visualizers/panels/ModelEditor/',
    '/src/visualizers/widget/ModelEditor/'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    // enable additional rules
    'linebreak-style': ['error', 'unix'],
    'no-undef': 'off', // no undefined variable errors, removed so errors for functions like "context" wont fail
    'new-cap': 'off' // constructors need to start with capital -> unnecessary so its removed
  }
}
