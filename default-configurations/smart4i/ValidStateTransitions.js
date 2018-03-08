const addClusterStateTransitions = require('../../helpers/resolveClusters');

const clusters = {
  /*whiteCluster: ["Running", "Paused", "Pausing"],
  transparentCluster: ["whiteCluster", "Suspending", "Suspended", "Unsuspending"],*/
  yellowCluster: [13, 0, 1, 2, 11, 12],
  redCluster: ["yellowCluster", 18, 15]
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
  //Aborting
  16: {
    done: 17
  },
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
  //Resetting
  13: {
    done: "0" // Idle
  },/*
  whiteCluster: {
    suspend: "Suspending"
  },
  transparentCluster: {
    hold: "Holding"
  },*/
  /*yellowCluster: {
    stop: "Stopping"
  },*/
  redCluster: {
    abort: 16
  }
};

addClusterStateTransitions(StateTransitions, clusters);
exports.stateTransitions = StateTransitions;
exports.initialState = 17;