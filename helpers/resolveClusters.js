/**
 * Adds the state transitions noted by clusters to the state transitions object.
 * @param StateTransitions
 * @param clusters
 */
function addClusterStateTransitions(StateTransitions, clusters) {
  for (let key in StateTransitions) {
    //console.log(key);
    // if it is a cluster
    if (clusters[key])
      resolveCluster(key, StateTransitions[key], StateTransitions, clusters);
  }
}

function resolveCluster(clusterName, followUpStates, StateTransitions, clusters) {
  clusters[clusterName].forEach(function (item) {
    // recursive if the item itself is a clusters
    if (clusters[item])
      return resolveCluster(item, followUpStates, StateTransitions, clusters);
    // if it is a single state
    addFollowUpStatesToSingleState(item, followUpStates, StateTransitions);
  });
}

function addFollowUpStatesToSingleState(state, followUpStates, StateTransitions) {
  // add multiple followUpStates to state
  for (let key in followUpStates) {
    if (followUpStates.hasOwnProperty(key))
      if (!StateTransitions[state])
        return new Error("Probable typo: " + state + " is not defined in StateTransitions.");
    StateTransitions[state][key] = followUpStates[key];
  }
}

module.exports = addClusterStateTransitions;