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
      start: "Starting"
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
  },
  Paused: {
    resume: "Running"
  },
  Suspending: {
    done: "Suspended"
  },
  Suspended: {
    unsuspend: "Unsuspended"
  },
  Unsuspended: {
    done: "Running"
  },
  Completing: {
    done: "Complete"
  },
  Complete: {
    reset: "Resetting"
  },
  Aborting: {
    done: "Aborted"
  },
  Aborted: {
      clear: "Clearing",
      reset: "Resetting"
  },
  Stopping: {
      done: "Stopped"
  },
  Stopped: {
      reset: "Resetting"
  },
  Holding: {
      done: "Held"
  },
  Held: {
      unhold: "Unholding"
  },
  Unholding: {
      done: "Running"
  },
  Clearing: {
      done: "Stopped"
  },
  Resetting: {
      done: "Idle"
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