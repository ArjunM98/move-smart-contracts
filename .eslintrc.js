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
    './src/BIPTemplates/',
    './src/seeds/Move-Smart-Contract.webgmex',
    './src/visualizers/panels/MoveCodeEditor/src',
    './src/decorators/ContractStateDecorator/Core/svgs',
    './src/common/README.md',
    './src/decorators/ContractStateDecorator/DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.css',
    './src/decorators/ContractStateDecorator/DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.html',
    './src/decorators/ContractStateDecorator/DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.scss',
    './src/decorators/ContractStateDecorator/PartBrowser/ContractStateDecorator.PartBrowserWidget.css',
    './src/decorators/ContractStateDecorator/PartBrowser/ContractStateDecorator.PartBrowserWidget.scss',
    'src/visualizers/panels/MoveCodeEditor/reactViz.bundle.js'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    // enable additional rules
    'linebreak-style': ['error', 'unix'],
    'no-undef': 'off', // no undefined variable errors with "context"
    'new-cap': 'off' // constructors need to start with capital -> uncessary
  }
}
