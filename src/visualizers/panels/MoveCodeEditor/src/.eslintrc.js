module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  ignorePatterns: [
    './src/visualizers/panels/MoveCodeEditor/src/App.css',
    'src/visualizers/panels/MoveCodeEditor/src/README.MD',
    './src/visualizers/panels/MoveCodeEditor/reactViz.bundle.js',
    '../reactViz.bundle.js'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    // enable additional rules
    'linebreak-style': ['error', 'unix'],
    'no-undef': 'off', // no undefined variable errors with "context"
    'new-cap': 'off' // constructors need to start with capital -> uncessary
  }
}
