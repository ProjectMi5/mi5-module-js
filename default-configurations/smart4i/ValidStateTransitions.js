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
    start: "1" // Running
  },
  1: {
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
    reset: 13
  },
  /*
  Aborting: {
    done: "Aborted"
  },*/
  // Aborted
  17: {
    clear: 18,
    reset: 13
  },/*
  Stopping: {
    done: "Stopped"
  },*/
  // Stopped
  15: {
    reset: 13
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
  18: {
    done: 15 // Stopped
  },
  13: {
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