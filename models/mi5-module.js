/**
 * Created by Dominik Serve on 15.06.2016.
 */

const simpleOpcua = require('mi5-simple-opcua');
const EventEmitter = require('events');
const debug = require('debug');

const OpcuaServer = simpleOpcua.OpcuaServer;
const mi5Skill = require('./mi5-skill');
const state = {
  type: 'Folder',
  content: {
    operationalState: {
      type: 'Variable',
      dataType: 'String',
      initValue: 'Idle'
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
        }
      }
    }
  }
};


class Mi5Module extends EventEmitter{
  constructor(name, settings){
    super();
    let self = this;
    this.name = name;
    this.server = new OpcuaServer();
    let newStructure = {};
    newStructure[name] = {
      type: 'Folder',
      content: {
        skills: {
          type: 'Folder',
          content: {}
        },
        state: state
      }
    };
    this.server.once('init', function(){
      newStructure = self.server.addStructure(self.server.structure.baseNodeId,'RootFolder', newStructure);
      newStructure = _getVariablesFromStructure(newStructure, self.server);
      //console.log(newStructure);

    });



  }
}

function _getVariablesFromStructure(structure, server){
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

module.exports = Mi5Module;