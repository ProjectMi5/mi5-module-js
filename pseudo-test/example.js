/**
 * Created by Dominik on 15.06.2016.
 */

var Mi5Module = require('./../models/mi5-module');
var config = require('./config');

var moduleSettings = {
  mqtt: {
    hostAddress: config.mqtt.host
  },
  opcua: {
    server: config.ServerStructure
  },
  indPhysx: {
    host: '127.0.0.1',
    port: '7771',
    modulePath: 'something'
  },
  simulateBehaviour: true,
  behaviour: {
    finishTask: 2000,
    setDone: 3000
  }
};

var TestModule = new Mi5Module('test module', moduleSettings);
TestModule.on('connect', function(){
  // 
});

TestModule.createSkill(0, 'Orange Juice', 2233, {simulateBehaviour:true, parameters: [{Name: "TestParameter", settings:{ID: 3456}}]});
