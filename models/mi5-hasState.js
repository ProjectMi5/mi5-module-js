const EventEmitter = require('events');
const stateTransitions = require('./ValidStateTransitions');

const stateStructure = {
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


class hasState extends EventEmitter {
  constructor(){
    super();
    this.state = "Aborted";
  }

  addStatesToServer(rootNodeId, server){
    let self = this;
    this.server = server;
    server.addStructure(rootNodeId, rootNodeId, stateStructure);
    this.stateVariables = this.getVariablesFromStructure(stateStructure, server);
    for(let key in this.stateVariables.stateTransition){
      if(key === 'nodeId')
        break;
      console.log(key);
      self.stateVariables.stateTransition[key].onChange((value)=>{
        if(value){
          console.log('State Transition: '+key+' '+value);
          //console.log('next state: '+stateTransitions[this.state]);
          self.performTransition(key);
        }
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
      this.stateVariables.operationalState.setValue(nextState);
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
}

module.exports = hasState;