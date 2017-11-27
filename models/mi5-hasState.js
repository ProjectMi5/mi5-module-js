const EventEmitter = require('eventemitter2');
const stateTransitions = require('./ValidStateTransitions').stateTransitions;
const stateStructure = require('./ServerStructure').stateStructure;
const initialState = require('./ValidStateTransitions').initialState;
const pathToStateTransitions = require('./ServerStructure').pathToStateTransitions;
const pathToOperationalState = require('./ServerStructure').pathToOperationalState;


class hasState extends EventEmitter {
  constructor(keysToBeReplaced){
    // using eventemitter2 because of wildcards
    super({
      wildcard: true,
      delimiter: ':',
      newListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true
    });
    this.state = initialState;
    this.keysToBeReplaced = keysToBeReplaced || {};
    this.stateStructure = this.replaceKeys(stateStructure, this.keysToBeReplaced);
  }

  addStatesToServer(rootNodeId, server){
    let self = this;
    this.server = server;

    this.stateStructure = server.addStructure(rootNodeId, rootNodeId, this.stateStructure);
    this.stateVariables = this.getVariablesFromStructure(this.stateStructure, server);
    let stateTransitions = this.getElement(this.stateVariables, pathToStateTransitions);
    for(let key in stateTransitions){
      if(key === 'nodeId')
        break;
      //console.log(key);
      stateTransitions[key].onChange((value)=>{
        if(value){
          console.log('State Transition: '+key+' '+value);
          //console.log('next state: '+stateTransitions[this.state]);
          self.performTransition(key);
        }
        stateTransitions[key].setValue(false);
      });
      //self.stateVariables.stateTransition[key].writeValue(false);
      //if(stateTransitions[this.state][key]){
        //if(stateTransitions[this.state][key])
          //this.stateVariables.stateTransition[key].setValue(stateTransitions[this.state][key]);
    }
  }

  done(){
    this.performTransition("done");
  }

  performTransition(trans){
    if(!stateTransitions[this.state])
      return;
    let nextState = stateTransitions[this.state][trans];

    if(nextState){
      if(nextState)
        this.emit(nextState);
      this.getElement(this.stateVariables, pathToOperationalState).setValue(nextState);
      this.state = nextState;
    }
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
    let self = this;
    for(let key in structure){
      if(!structure.hasOwnProperty(key))
        break;
      if(structure[key].type === 'Variable'){
        newStructure[key] = server.getVariable(structure[key].nodeId);
      } else if (!structure[key].content){
        newStructure[key] = {};
      } else {
        newStructure[key] = self.getVariablesFromStructure(structure[key].content, server);
      }
      newStructure[key].nodeId = structure[key].nodeId;
    }
    return newStructure;
  }

  /**
   * Replaces Keys from objects and replaces them accordingly
   * @param structure
   * @param keysToBeReplaced Array like this: [{key: "($moduleName)", replacement: "BlaModule"}, ...]
   * @returns newStructure
   */
  replaceKeys(structure, keysToBeReplaced){
    let structureString = JSON.stringify(structure);
    keysToBeReplaced.forEach((item)=>{
      structureString = structureString.split(item.key).join(item.replacement);
    });
    return JSON.parse(structureString);
  }

  getElement(variableStructure, path){
    let pathString = path.toString();
    let substructure = variableStructure;
    path.forEach((item)=>{
      substructure = substructure[item];
      if(typeof substructure === 'undefined'){
        return new Error("Could not find item "+item+" in path "+pathString);
      }
    });
    return substructure;
  }
}

module.exports = hasState;