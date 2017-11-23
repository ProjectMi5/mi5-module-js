/**
 * Created by Dominik Serve on 15.06.2016.
 */

const simpleOpcua = require('mi5-simple-opcua');
const EventEmitter = require('events');
const debug = require('debug');

const OpcuaServer = simpleOpcua.OpcuaServer;
const mi5Skill = require('./mi5-skill-definition');
const hasState = require('./mi5-hasState');

const defaultStructure = {
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
};


class Mi5Module extends hasState{
  constructor(name, settings){
    super();
    let self = this;
    this.name = name;
    this.server = new OpcuaServer();
    let newStructure = {};
    newStructure[name] = defaultStructure;
    this.server.once('init', function(){
      newStructure = self.server.addStructure(self.server.structure.baseNodeId,'RootFolder', newStructure);
      self.rootFolder = newStructure.nodeId;

      self.variables = self.getVariablesFromStructure(newStructure, self.server);
      //console.log(newStructure);
    });
  }

  /**
   * helper function
   * @param structure
   * @param server
   * @returns {{}}
   * @private
   */
  getVariablesFromStructure(structure, server){
    let newStructure = {};
    for(let key in structure){
      if(structure[key].type === 'Variable'){
        newStructure[key] = server.getVariable(structure[key].nodeId);
      } else if (!structure[key].content){
        break;
      } else {
        newStructure[key] = _getVariablesFromStructure(structure[key].content, server);
      }
    }
    return newStructure;
  }
}
module.exports = Mi5Module;