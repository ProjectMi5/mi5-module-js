const EventEmitter = require('events');
const stateTransitions = require('./ValidStateTransitions');

const state = {
  type: 'Folder',
  content: {
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
        }
      }
    }
  }
};




class hasState extends EventEmitter {
  constructor(){
    super();
    this.state = "aborted";
  }

  addStatesToServer(rootFolder, server){

  }

  done(){
    this.performTransition("done");
  }

  performTransition(trans){
    let nextState = stateTransitions[this.state][trans];
    if(nextState)
      this.emit(nextState);
    this.state = nextState;
  }
}