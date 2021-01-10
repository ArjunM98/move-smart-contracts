define([
  'ejs',
  'text!./moduleStart.ejs',
  'text!./baseResource.ejs',
  'text!./resource.ejs',
  'text!./createTransition.ejs',
  'text!./transitions.ejs',
  'text!./moduleEnd.ejs',
  'text!./imports.ejs',
  'text!./moduleComplete.ejs'
], function (ejs,
  moduleStart,
  baseResource,
  resource,
  createTransition,
  transition,
  moduleEnd,
  imports,
  complete) {
  return {
    contractType: {
      complete: ejs.render(complete, {
        moduleStart: moduleStart,
        imports: imports,
        baseResource: baseResource,
        resource: resource,
        createTransition: createTransition,
        transition: transition,
        moduleEnd: moduleEnd
      })
    }
  }
})
