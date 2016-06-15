/**
 * Created by Dominik on 15.06.2016.
 */

var Mi5Module = require('mi5-module').Mi5Module;
var config = require('./config');

var moduleSettings = {
  mqtt: {
    hostAddress: config.mqtt.host
  },
  opcua: {
    server: config.ServerStructure
  },
  simulateBehaviour: true,
  behaviour: {
    finishTask: 2000,
    setDone: 3000,
    setReady: 4000
  }
};

var TestModule = new Mi5Module('test module', moduleSettings);
TestModule.on('connect', function(){
  console.log('received event.');
  var Mi5Skill = require('mi5-module').Mi5Skill;
  var TestSkill = new Mi5Skill(0, 'TestSkill', TestModule);
});
