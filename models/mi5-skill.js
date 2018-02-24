// JavaScript source code

const hasState = require('./mi5-hasState');
const variable = require('./mi5-module-variable');

let defaults = require("./setDefaults");
let ServerStructure;
let skillStructure;
let pathToSkillBaseFolder;
let pathToSkillStates;
let pathToSkillOutputParameters;
let pathToSkillInputParameters;


class Skill extends hasState {
  /**
   *
   * @param {Mi5Module} module
   * @param {string} skillName
   * @param {string|number} skillId
   */
  constructor(module, skillName, skillId) {
    ServerStructure = defaults.ServerStructure;
    skillStructure = ServerStructure.skillStructure;
    pathToSkillBaseFolder = ServerStructure.pathToSkillsBaseFolder;
    pathToSkillStates = ServerStructure.pathToSkillStates;
    pathToSkillOutputParameters = ServerStructure.pathToSkillOutputParameters;
    pathToSkillInputParameters = ServerStructure.pathToSkillInputParameters;

    let replacements = JSON.parse(JSON.stringify(module.replacements));
    replacements.push({key: "$(skillName)", replacement: skillName});
    replacements.push({key: "$(skillId)", replacement: skillId});

    super(replacements);

    this.name = skillName;
    this.skillId = skillId;
    this.module = module;
    this.server = module.server;
    this.inputParameters = [];
    this.outputParameters = [];
    this.initialized = false;
    this.skillStructure = this.replaceKeys(skillStructure, replacements);
    this.pathToSkillStates = this.replaceKeys(pathToSkillStates, replacements);
    this.pathToSkillBaseFolder = this.replaceKeys(pathToSkillBaseFolder, replacements);
    this.pathToSkillInputParameters = this.replaceKeys(pathToSkillInputParameters, replacements);
    this.pathToSkillOutputParameters = this.replaceKeys(pathToSkillOutputParameters, replacements);

    if (this.module.init)
      this.init();
    else {
      this.module.once('init', () => {
        this.init();
      });
    }
  }

  init() {
    // add folder structure
    this.baseFolder = this.getElement(this.module.structure, this.pathToSkillBaseFolder).nodeId;
    this.structure = this.server.addStructure(this.baseFolder, this.baseFolder, this.skillStructure);
    this.structure = this.getVariablesFromStructure(this.structure, this.server);
    // add states
    this.statesFolder = this.getElement(this.structure, this.pathToSkillStates);
    this.addStatesToServer(this.statesFolder.nodeId, this.server);
    this.initialized = true;
    this.emit('init');
  }

  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {String|Number|Boolean} initValue
   * @param {Array<String>} [path]
   * @param {String} [nodeId]
   */
  addInputParameter(name, type, initValue, path = this.pathToSkillInputParameters, nodeId){
    let parameter = this.addParameter(name, type, initValue, path, nodeId);
    this.inputParameters.push(parameter);
    return parameter;
  }

  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {String|Number|Boolean} initValue
   * @param {String} nodeId
   * @param {Array<String>} [path]
   * @param {String} [nodeId]
   */
  addOutputParameter(name, type, initValue, path = this.pathToSkillOutputParameters, nodeId){
    let parameter = this.addParameter(name, type, initValue, path, nodeId);
    this.outputParameters.push(parameter);
    return parameter;
  }

  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {String|Number|Boolean} initValue
   * @param {Array<String>} path
   * @param {String} [nodeId]
   */
  addParameter(name, type, initValue, path, nodeId){
    return new variable(this, name, type, initValue, path, nodeId);
  }
  
  getOutputParameter(name){
    for(let i = 0; i<this.outputParameters.length; i++){
      if(this.outputParameters[i].name === name)
        return this.outputParameters[i];
    }
    return null;
  }

  getInputParameter(name){
    for(let i = 0; i<this.inputParameters.length; i++){
      if(this.inputParameters[i].name === name)
        return this.inputParameters[i];
    }
    return null;
  }
}

module.exports = Skill;