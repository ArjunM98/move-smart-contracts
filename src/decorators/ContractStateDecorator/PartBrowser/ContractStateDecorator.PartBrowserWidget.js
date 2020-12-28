define([
  'js/Constants',
  'js/NodePropertyNames',
  'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
  '../Core/ContractStateDecorator.Core',
  'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
  'text!../DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.html',
  'css!../DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.css',
  'css!./ContractStateDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
  nodePropertyNames,
  PartBrowserWidgetDecoratorBase,
  ContractStateDecoratorCore,
  DiagramDesignerWidgetConstants,
  ContractStateDecoratorDiagramDesignerWidgetTemplate) {
  'use strict'

  const __parent__ = PartBrowserWidgetDecoratorBase
  const DECORATOR_ID = 'ContractStateDecoratorPartBrowserWidget'

  const ContractStateDecoratorPartBrowserWidget = function (options) {
    const opts = _.extend({}, options)

    PartBrowserWidgetDecoratorBase.apply(this, [opts])
    ContractStateDecoratorCore.apply(this, [opts])

    this.logger.debug('ContractStateDecoratorPartBrowserWidget ctor')
  }

  _.extend(ContractStateDecoratorPartBrowserWidget.prototype, __parent__.prototype)
  _.extend(ContractStateDecoratorPartBrowserWidget.prototype, ContractStateDecoratorCore.prototype)
  ContractStateDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID

  /** ********************* OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

  ContractStateDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
    const el = $(ContractStateDecoratorDiagramDesignerWidgetTemplate)
    // use the same HTML template as the ContractStateDecorator.DiagramDesignerWidget
    // but remove the connector DOM elements since they are not needed in the PartBrowser
    el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove()
    return el
  })()

  ContractStateDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
    this.$el = this.$DOMBase.clone()

    this._renderContent()
  }

  ContractStateDecoratorPartBrowserWidget.prototype.afterAppend = function () {
  }

  ContractStateDecoratorPartBrowserWidget.prototype._renderContent = function () {
    const client = this._control._client
    const nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID])
    let metaNode

    if (nodeObj) {
      this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || ''
      metaNode = client.getNode(nodeObj.getMetaTypeId())
      if (metaNode) {
        this.metaTypeName = metaNode.getAttribute('name')
      }
    }

    this.updateSvg()
  }

  ContractStateDecoratorPartBrowserWidget.prototype.update = function () {
    this._renderContent()
  }

  return ContractStateDecoratorPartBrowserWidget
})
