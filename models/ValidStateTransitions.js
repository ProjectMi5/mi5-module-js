const clusters ={
  whiteCluster: ["Running", "Paused", "Pausing"],
  transparentCluster: ["whiteCluster", "Suspending", "Suspended", "Unsuspending"],
  yellowCluster: ["transparentCluster", "Idle", "Starting", "Completing", "Complete", "Resetting", "Holding", "Held", "Unholding"],
  redCluster: ["yellowCluster", "Clearing", "Stopped", "Stopping"]
};

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
  Unsuspending:{
    suspend: "Suspended"
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
  },
  whiteCluster:{
    suspend: "Suspending"
  },
  transparentCluster:{
    hold: "Holding"
  },
  yellowCluster:{
    stop: "Stopping"
  },
  redCluster:{
    abort: "Aborting"
  }

};

function addClusterStateTransitions(){
  for(let key in StateTransitions){
    //console.log(key);
    // if it is a cluster
    if(clusters[key])
      resolveCluster(key, StateTransitions[key]);
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
    if(followUpStates.hasOwnProperty(key))
      if(!StateTransitions[state])
        return new Error("Probable typo: "+state+" is not defined in StateTransitions.");
      StateTransitions[state][key] = followUpStates[key];
  }
}

addClusterStateTransitions();
exports.stateTransitions = StateTransitions;
exports.initialState = "Aborted";