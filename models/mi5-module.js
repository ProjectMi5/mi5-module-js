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
    this.server = new OpcuaServer(settings.port);
    let newStructure = {};
    newStructure[name] = defaultStructure;
    self.server.start();
    self.once('init', ()=>{
      //self.server.start();
    });
    this.server.once('init', function(){
      newStructure = self.server.addStructure(self.server.structure.baseNodeId,'RootFolder', newStructure);
      //self.skillsFolder = newStructure[]
      self.structure = self.getVariablesFromStructure(newStructure, self.server);
      self.rootFolder = self.structure[name].nodeId;
      self.stateFolder = self.structure[name]['state'].nodeId;
      console.log(self.structure);
      self.addStatesToServer(self.stateFolder, self.server);
      self.emit('init');
    });
  }
}
module.exports = Mi5Module;