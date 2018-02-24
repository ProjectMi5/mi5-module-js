const addClusterStateTransitions = require('../../helpers/resolveClusters');

const clusters = {
  /*whiteCluster: ["Running", "Paused", "Pausing"],
  transparentCluster: ["whiteCluster", "Suspending", "Suspended", "Unsuspending"],
  yellowCluster: ["transparentCluster", "Idle", "Starting", "Completing", "Complete", "Resetting", "Holding", "Held", "Unholding"],
  redCluster: ["yellowCluster", "Clearing", "Stopped", "Stopping"]*/
};

let StateTransitions = {
  // Idle
  0: {
    start: "Starting" // Running
  },
  Starting: {
    done: 2 // Running
  },
  // Running
  2: {
    done: 12 // Complete
  },/*
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
  Unsuspending: {
    suspend: "Suspended"
  },
  Completing: {
    done: "Complete"
  },*/
  // Complete
  12: {
    reset: "Resetting"
  },
  /*
  Aborting: {
    done: "Aborted"
  },*/
  // Aborted
  17: {
    clear: "Clearing",
    reset: "Resetting"
  },/*
  Stopping: {
    done: "Stopped"
  },*/
  // Stopped
  15: {
    reset: "Resetting"
  },
  /*
  Holding: {
    done: "Held"
  },
  Held: {
    unhold: "Unholding"
  },
  Unholding: {
    done: "Running"
  },*/
  Clearing: {
    done: 15 // Stopped
  },
  Resetting: {
    done: "0" // Idle
  },/*
  whiteCluster: {
    suspend: "Suspending"
  },
  transparentCluster: {
    hold: "Holding"
  },
  yellowCluster: {
    stop: "Stopping"
  },
  redCluster: {
    abort: "Aborting"
  }*/
};

addClusterStateTransitions(StateTransitions, clusters);
exports.stateTransitions = StateTransitions;
exports.initialState = 17;