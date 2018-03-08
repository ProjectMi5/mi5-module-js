exports.baseNode = "RootFolder";

exports.moduleStructure = {
  "mi5":{
    type: 'Folder',
    content: {
      "$(moduleName)": {
        type: 'Folder',
        content: {
          identification:{
            type: 'Folder',
            content: {}
          },
          skill: {
            type: 'Folder',
            content: {}
          },
          state: {
            type: 'Folder'
          },
          variables: {
            type: 'Folder'
          }
        }
      }
    }
  }
};

exports.skillStructure = {
  "$(skillName)": {
    type: 'Folder',
    content: {
      state: {
        type: 'Folder'
      },
      inputParameters: {
        type: 'Folder'
      },
      outputParameters: {
        type: 'Folder'
      }
    }
  }
};

exports.stateStructure = {
  errorAcknowledge: {
    type: 'Variable',
    dataType: 'Boolean',
    initValue: false
  },
  stateMachine: {
    type: 'Folder',
    content: {
      operationalState: {
        type: 'Variable',
        dataType: 'String',
        initValue: '17'
      },
      errorMessage: {
        type: 'Folder',
        content: {
          messageID: {
            type: 'Variable',
            dataType: 'Integer',
            initValue: 0
          },
          messageType: {
            type: 'Variable',
            dataType: 'String',
            initValue: ''
          },
          messageText: {
            type: 'Variable',
            dataType: 'String',
            initValue: ''
          },
          messageTime: {
            type: 'Variable',
            dataType: 'String',
            initValue: ''
          },
        }
      },
      stateTransition: {
        type: 'Folder',
        content: {
          start: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          pause: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          resume: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          suspend: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          unsuspend: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          hold: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          unhold: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          stop: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          abort: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          clear: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          reset: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          },
          done: {
            type: 'Variable',
            dataType: 'Boolean',
            initValue: false
          }
        }
      }
    }
  }
};


exports.stateVariablesStructure = {};

exports.skillParametersStructure = {};

exports.skillParametersStructure = {};

exports.pathToModule = ["mi5", "$(moduleName)"];
exports.pathToModuleIdentification = ["mi5", "$(moduleName)", "identification"];
exports.pathToModuleStates = ["mi5", "$(moduleName)", "state"];
exports.pathToModuleStateVariables = ["mi5", "$(moduleName)", "variables"];
exports.pathToSkillsBaseFolder = ["mi5", "$(moduleName)", "skill"];
exports.pathToSkillStates = ["$(skillName)","state"];
exports.pathToSkillInputParameters = ["$(skillName)","inputParameters"];
exports.pathToSkillOutputParameters = ["$(skillName)","outputParameters"];
exports.pathToStateTransitions = ["stateMachine", "stateTransition"];
exports.pathToOperationalState = ["stateMachine", "operationalState"];


