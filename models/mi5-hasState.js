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

const clusters ={
  whiteCluster: ["Running", "Paused", "Pausing"],
  transparentCluster: ["whiteCluster", "Suspending", "Suspended", "Unsuspending"],
  yellowCluster: ["transparentCluster", "Idle", "Starting", "Completing", "Complete", "Resetting", "Holding", "Held", "Unholding"],
  redCluster: ["yellowCluster", "Clearing", "Stopped", "Stopping"]
};

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



};

function addClusterStateTransitions(){
  for(let key in StateTransitions){
    // if it is a clusters
    if(clusters[key])
      resolveCluster(key, clusters[key]);
  }
}

function resolveCluster(clusterName, followUpStates){
  clusters[clusterName].forEach(function(item){
    // recursive if the item itself is a clusters
    if(clusters[item])
      return resolveCluster(item, followUpStates);
    // if it is a single state
    addFollowUpStatesToSingleState(item, followUpStates);
  });
}

function addFollowUpStatesToSingleState(state, followUpStates){
  // add multiple followUpStates to state
  for(let key in followUpStates){
    StateTransitions[state] = followUpStates[key];
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