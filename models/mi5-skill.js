// JavaScript source code

const hasState = require('./mi5-hasState');
const variable = require('./mi5-module-variable');

const ServerStructure = require("./ServerStructure");
const skillStructure = ServerStructure.skillStructure;
const pathToSkillBaseFolder = ServerStructure.pathToSkillsBaseFolder;
const pathToSkillStates = ServerStructure.pathToSkillStates;
const pathToSkillOutputParameters = ServerStructure.pathToSkillOutputParameters;
const pathToSkillInputParameters = ServerStructure.pathToSkillInputParameters;


class Skill extends hasState {
  /**
   *
   * @param {Mi5Module} module
   * @param {string} skillName
   * @param {string|number} skillId
   */
  constructor(module, skillName, skillId) {
    let replacements = module.replacements;
    replacements.push({key: "$(skillName)", replacement: skillName});
    replacements.push({key: "$(skillId)", replacement: skillId});

    super(replacements);

    this.skillName = skillName;
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
}

module.exports = Skill;