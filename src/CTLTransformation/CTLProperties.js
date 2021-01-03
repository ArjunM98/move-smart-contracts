define([], function () {
  'use strict'

  // Default constructor
  const CTLProperties = function () {}
  CTLProperties.prototype.constructor = CTLProperties

  CTLProperties.prototype.parseProperties = function (model, properties) {
    const parsedProperties = []
    let clauses; let actions
    let property; let clause; let action; let actionName
    let transitions; let transition

    for (property of properties.split(';')) {
      clauses = [] // collect all clauses for this property
      for (clause of property.split('#')) {
        actions = [] // collect all actions for this clause
        for (action of clause.split('|')) {
          actionName = action.replace(/\s/g, '') // all comparisons will be whitespace-agnostic
          transitions = []
          for (transition of model.transitions) { // for each transition, check if it matches the action specification
            if (transition.actionName !== undefined && transition.actionName.replace(/[;\s]+/g, '') === actionName) {
              transitions.push(transition.actionName)
            }
          }
          if (transitions.length !== 1) { // action specification is ambiguous since multiple transitions match it
            if (transitions.length === 0) {
              throw new Error('Could not find action: ' + action + ' Possible reason: Statement was specified without function name.')
            }
            throw new Error('Ambiguous action (multiple instances occured): ' + action)
          }
          actions.push(transitions[0]) // single transition matches the action specification
        }
        clauses.push(actions) // push this clause
      }
      parsedProperties.push(clauses) // push this property
    }
    return parsedProperties
  }

  // Generate template that confirms <action> cannot be reached after <action>
  CTLProperties.prototype.generateFirstTemplateProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    let property; let clause; let propertiesSMV = ''
    // Essentially: AG(q -> AG (¬p))
    // p can never happen after q
    for (property of properties) {
      propertiesSMV += '-- AG ( ' // "All Globally"
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ' -> AG (!('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')))\n'
      propertiesSMV += 'CTLSPEC AG ( '
      for (clause of property[1]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ' -> AG (!('
      for (clause of property[0]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')))\n\n'
    }
    return propertiesSMV
  }

  // Generate text template that confirms <action> cannot be reached after <action>
  CTLProperties.prototype.generateFirstTemplatePropertiesTxt = function (properties) {
    let property; let clause; let propertiesSMV = ''
    // This is literally saying the property as it goes along
    for (property of properties) {
      propertiesSMV += '('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') can happen only after ('
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')\n'
    }
    return propertiesSMV
  }

  // Generate template that confirms <action> can only occur after <action>
  CTLProperties.prototype.generateSecondTemplateProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    let property; let clause; let propertiesSMV = ''
    for (property of properties) {
      propertiesSMV += '-- A [ !('
      for (clause of property[0]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') U (' // "Until"
      for (clause of property[1]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')]\n'
      propertiesSMV += 'CTLSPEC A [ !('
      for (clause of property[0]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') U ('
      for (clause of property[1]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')]\n\n'
    }
    return propertiesSMV
  }

  // Generate text template that confirms <action> can only occur after <action>
  CTLProperties.prototype.generateSecondTemplatePropertiesTxt = function (properties) {
    // This is literally saying the property as it goes along
    let property; let clause; let propertiesSMV = ''
    for (property of properties) {
      propertiesSMV += '('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') can happen only after ('
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')\n'
    }
    return propertiesSMV
  }

  // Generate template that confirms the fairness of <action> only occuring after <action>
  CTLProperties.prototype.generateSecondTemplateFairnessProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    let property; let clause; let fairnessProperties = ''
    for (property of properties) {
      for (clause of property[0]) {
        fairnessProperties += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
    }
    return fairnessProperties
  }

  // Generate template that confirms if <action> occurs, <action> happens only after <action>
  CTLProperties.prototype.generateThirdTemplateProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    let property; let clause; let propertiesSMV = ''
    // Essentially: AG(p → AX A [¬ q W r])
    // if p happens, q can happen only after r happens
    for (property of properties) {
      propertiesSMV += '-- AG ('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') -> AX A [ !('
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') U ('
      for (clause of property[2]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')]\n'
      propertiesSMV += 'CTLSPEC AG (('
      for (clause of property[0]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') -> AX A [ !('
      for (clause of property[1]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') U ('
      for (clause of property[2]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')])\n\n'
    }
    return propertiesSMV
  }

  // Generate text template that confirms if <action> occurs, <action> happens only after <action>
  CTLProperties.prototype.generateThirdTemplatePropertiesTxt = function (properties) {
    // This is literally saying the property as it goes along
    let property; let clause; let propertiesSMV = ''
    for (property of properties) {
      propertiesSMV += 'If ('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') happens, ('
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') can happen only after ('
      for (clause of property[2]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') happens\n'
    }
    return propertiesSMV
  }

  // Generate fairness template that confirms if <action> occurs, <action> happens only after <action>
  CTLProperties.prototype.generateThirdTemplateFairnessProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    let property; let clause; let fairnessProperties = ''
    for (property of properties) {
      for (clause of property[2]) {
        fairnessProperties += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
    }
    return fairnessProperties
  }

  // Generate template that confirms <action> will eventually happen after <action>
  CTLProperties.prototype.generateFourthTemplateProperties = function (bipTransitionsToSMVNames, actionNamesToTransitionNames, properties) {
    // Essentially: AG (q → AF (p))
    // p will eventually happen after q
    let property; let clause; let propertiesSMV = ''
    for (property of properties) {
      propertiesSMV += '-- AG (('
      for (clause of property[1]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') -> AF ('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += '))\n'
      propertiesSMV += 'CTLSPEC AG (('
      for (clause of property[1]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') -> AF ('
      for (clause of property[0]) {
        propertiesSMV += bipTransitionsToSMVNames[actionNamesToTransitionNames[clause]] + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += '))\n\n'
    }
    return propertiesSMV
  }

  // Generate text template that confirms <action> will eventually happen after <action>
  CTLProperties.prototype.generateFourthTemplatePropertiesTxt = function (properties) {
    // This is literally saying the property as it goes along
    let property; let clause; let propertiesSMV = ''
    for (property of properties) {
      propertiesSMV += '('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ') will eventually happen after ('
      for (clause of property[0]) {
        propertiesSMV += clause + '|'
      }
      propertiesSMV = propertiesSMV.slice(0, -1)
      propertiesSMV += ')\n'
    }
    return propertiesSMV
  }

  return CTLProperties
})
