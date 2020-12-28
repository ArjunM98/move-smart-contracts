define([
  'js/Decorators/DecoratorBase',
  './DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget',
  './PartBrowser/ContractStateDecorator.PartBrowserWidget'
], function (DecoratorBase, ContractStateDecoratorDiagramDesignerWidget, ContractStateDecoratorPartBrowserWidget) {
  'use strict'

  const __parent__ = DecoratorBase
  const __parent_proto__ = DecoratorBase.prototype /* eslint camelcase: "off" */
  const DECORATOR_ID = 'ContractStateDecorator'

  const ContractStateDecorator = function (params) {
    const opts = _.extend({ loggerName: this.DECORATORID }, params)

    __parent__.apply(this, [opts])

    this.logger.debug('ContractStateDecorator ctor')
  }

  _.extend(ContractStateDecorator.prototype, __parent_proto__)
  ContractStateDecorator.prototype.DECORATORID = DECORATOR_ID

  /** ********************* OVERRIDE DecoratorBase MEMBERS **************************/

  ContractStateDecorator.prototype.initializeSupportedWidgetMap = function () {
    this.supportedWidgetMap = {
      DiagramDesigner: ContractStateDecoratorDiagramDesignerWidget,
      PartBrowser: ContractStateDecoratorPartBrowserWidget
    }
  }

  return ContractStateDecorator
})
