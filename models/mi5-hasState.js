const EventEmitter = require('events');

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

const whiteCluster = ["Running", "Paused", "Pausing"];
const transparentCluster = [whiteCluster, "Suspending", "Suspended", "Unsuspending"];
const yellowCluster = [transparentCluster, "Idle", "Starting", "Completing", "Complete", "Resetting", "Holding", "Held", "Unholding"];
const redCluster = [yellowCluster, "Clearing", "Stopped", "Stopping"];

let StateTransitions = {
  Idle: {
    start: "Starting",
  },
  Starting: {
    done: "Running"
  },
  Running: {
    pause: "Pausing",
    done: "Completing"
  },
  Pausing: {
    suspend: "Suspending"
  }



}


class hasState extends EventEmitter{
  constructor(){
    super();
    this.state = "aborted";
  }

  start(){

    this.on('start', function(){

    });
    this.emit('start');


  }

  stop(){

  }


}