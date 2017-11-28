const OpcuaVariable = require('mi5-simple-opcua').OpcuaServerVariable;

class Variable {
  constructor(parent, name, type, initValue, path, nodeId){
    this.parent = parent;
    this.server = parent.server;
    this.name = name;
    this.type = type;
    this.initValue = initValue;
    this.path = path;
    this.nodeId = nodeId;

    if(!parent.initialized) {
      this.opcuaVariable = new OpcuaVariable(undefined, undefined, undefined, true);
      parent.once('init', () => {
        this.init();
      });
    } else
      this.init();
  }

  init(){
    let folder = this.parent.getElement(this.parent.structure, this.path).nodeId;
    let structure = {};
    structure[this.name] = {
      type: 'Variable',
      nodeId: this.nodeId,
      dataType: this.type,
      initValue: this.initValue
    };
    this.structure = this.server.addStructure(folder, folder, structure)[this.name];
    this.nodeId = this.structure.nodeId;

    // now replace dummy opcua variable with real one
    let opcuaVariable = this.server.getVariable(this.nodeId);
    opcuaVariable.listeners = this.opcuaVariable.listeners;
    opcuaVariable.oneTimeListeners = this.opcuaVariable.oneTimeListeners;

    this.opcuaVariable = opcuaVariable;
  }

  onChange(callback){
    this.opcuaVariable.onChange(callback);
  }

  oneChange(callback){
    this.opcuaVariable.oneChange(callback);
  }

  monitor(){
    this.opcuaVariable.monitor();
  }

  unmonitor(){
    this.opcuaVariable.unmonitor();
  }

  setValue(value){
    this.opcuaVariable.setValue(value);
  }

  getValue(){
    return this.opcuaVariable.getValue();
  }
}

module.exports = Variable;