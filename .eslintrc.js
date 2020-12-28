module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  ignorePatterns: [
    './src/visualizers/panels/MoveCodeEditor/src',
    'src/visualizers/panels/MoveCodeEditor/reactViz.bundle.js'
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
