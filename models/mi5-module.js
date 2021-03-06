/**
 * Created by Dominik Serve on 15.06.2016.
 * Rewritten in November 2017.
 */

const simpleOpcua = require('mi5-simple-opcua');
const variable = require('./mi5-module-variable');
const debug = require('debug');

const OpcuaServer = simpleOpcua.OpcuaServer;
const mi5Skill = require('./mi5-skill');
const hasState = require('./mi5-hasState');

let defaults = require('./setDefaults');
let serverStructure;
let defaultStructure;
let baseNode;
let pathToModule;
let pathToModuleStates;
let pathToModuleStateVariables;

// each module can have its own server or share one server with others.
// this is why we save the servers by port:
let servers = {};


class Mi5Module extends hasState {
  /**
   * Constructor of a module. A module at least needs a name.
   * @param moduleName
   * @param [moduleId]
   * @param [settings]
   * @param [settings.port] server port
   * @param [settings.serverSettings] server settings. see [node-opcua documentation]{@link http://node-opcua.github.io/api_doc/classes/OPCUAServer.html}
   */
  constructor(moduleName, moduleId, settings) {
    // with replacements the placeholder keys in the serverstructure will be replaced
    let replacements = [{key: "$(moduleName)", replacement: moduleName}, {key: "$(moduleId)", replacement: moduleId}];
    serverStructure = defaults.ServerStructure;
    defaultStructure = serverStructure.moduleStructure;
    baseNode = serverStructure.baseNode;
    pathToModule = serverStructure.pathToModule;
    pathToModuleStates = serverStructure.pathToModuleStates;
    pathToModuleStateVariables = serverStructure.pathToModuleStateVariables;
    // instantiate the hasState superclass
    super(replacements);

    // annotate this instance with its input
    let self = this;
    this.name = moduleName;
    this.id = moduleId;
    this.replacements = replacements;
    this.skills = [];
    this.stateVariables = [];
    this.pathToModule = this.replaceKeys(pathToModule, replacements);
    this.pathToModuleStates = this.replaceKeys(pathToModuleStates, replacements);
    this.pathToModuleStateVariables = this.replaceKeys(pathToModuleStateVariables, replacements);

    // create and start server if it does not already exist
    settings = settings || {};
    settings.port = settings.port || 4840;
    if (servers[settings.port])
      this.server = servers[settings.port];
    else {
      this.server = new OpcuaServer(settings.port, {}, settings.serverSettings);
      servers[settings.port] = this.server;
      //self.server.start();
    }

    // fill server with life
    let newStructure = this.replaceKeys(defaultStructure, replacements);
    this.server.once('init', () => {
      // server.addStructure annotates the structure with nodeIds etc.
      newStructure = self.server.addStructure(self.server.structure.baseNodeId, baseNode, newStructure);
      // this.getVariablesFromStructure reduces the structure to the necessary elements
      self.structure = self.getVariablesFromStructure(newStructure, self.server);
      self.rootFolder = self.getElement(self.structure, self.pathToModule).nodeId;
      self.stateFolder = self.getElement(self.structure, self.pathToModuleStates).nodeId;
      self.stateVariablesFolder = self.getElement(self.structure, self.pathToModuleStateVariables).nodeId;
      //console.log(self.structure);
      self.addStatesToServer(self.stateFolder, self.server);

      // it also strips the "element.content" declaration. this would not be necessary if one rewrites this.getElement()
      self.init = true;
      self.emit('init');
    });
  }

  addSkill(name, id){
    let skill = new mi5Skill(this, name, id);
    this.skills.push(skill);
    return skill;
  }

  /**
   *
   * @param {String} name
   * @param {String} type
   * @param {String|Number|Boolean} initValue
   * @param {Array<String>} path
   * @param {String} [nodeId]
   */
  addStateVariable(name, type, initValue, path = this.pathToModuleStateVariables, nodeId){
    let varble = new variable(this, name, type, initValue, path, nodeId);
    this.stateVariables.push(varble);
    return varble;
  }

  getSkill(name){
    for(let i = 0; i<this.skills.length; i++){
      if(this.skills[i].name === name)
        return this.skills[i];
    }
    return null;
  }

  getStateVariable(name){
    for(let i = 0; i<this.stateVariables.length; i++){
      if(this.stateVariables[i].name === name)
        return this.stateVariables[i];
    }
    return null;
  }
}

module.exports = Mi5Module;