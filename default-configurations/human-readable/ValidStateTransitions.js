const addClusterStateTransitions = require('../../helpers/resolveClusters');

const clusters = {
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
  Unsuspending: {
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
  }

};

addClusterStateTransitions(StateTransitions, clusters);
exports.stateTransitions = StateTransitions;
exports.initialState = "Aborted";