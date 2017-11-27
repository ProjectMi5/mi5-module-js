exports.baseNode = "RootFolder";

exports.moduleStructure = {
  "$(moduleName)": {
    type: 'Folder',
    content: {
      skills: {
        type: 'Folder',
        content: {}
      },
      state: {
        type: 'Folder'
      }
    }
  }
};

exports.skillStructure = {};

exports.stateStructure = {
  operationalState: {
    type: 'Variable',
    dataType: 'String',
    initValue: 'Aborted'
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
};


exports.stateVariablesStructure = {};

exports.skillParametersStructure = {};

exports.skillParametersStructure = {};

exports.pathToModule = ["$(moduleName)"];
exports.pathToModuleStates = ["$(moduleName)", "state"];
exports.pathToModuleStateVariables = [];
exports.pathToSkillsBaseFolder = ["$(moduleName)", "skills"];
exports.pathToSkillStates = ["$(skillName)", "state"];
exports.pathToSkillInputParameters = ["$(skillName)", "state"];
exports.pathToSkillOutputParameters = ["$(skillName)", "state"];
exports.pathToStateTransitions = ["stateTransition"];
exports.pathToOperationalState = ["operationalState"];


