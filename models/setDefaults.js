let ServerStructure = require('../default-configurations/human-readable/ServerStructure');
let ValidStateTransitions = require('../default-configurations/human-readable/ValidStateTransitions');
const _ = require("underscore");

/**
 * Sets the ServerStructure and StateTransitions
 * @param config either a String "default", "smart4i" or a object {serverStructure: ServerStructure, validStateTransitions: ValidStateTransitions}
 */
function setDefaults(config){
  if(_.isString(config)){
    let location;
    if(config === "smart4i")
      location = '../default-configurations/smart4i/';
    else if(config === "human-readable")
      return;
    else if(config === "default")
      return;
    else if(config === true)
      return;

    if(!location)
      throw new Error("Your default configuration name is unknown.");

    module.exports.ServerStructure = require(location+"ServerStructure");
    module.exports.ValidStateTransitions = require(location + "ValidStateTransitions");
  } else {
    module.exports.ServerStructure = config.serverStructure || ServerStructure;
    module.exports.ValidStateTransitions = config.validStateTransitions || ValidStateTransitions;
  }
}

module.exports.ServerStructure = ServerStructure;
module.exports.ValidStateTransitions = ValidStateTransitions;
module.exports.setDefaults = setDefaults;