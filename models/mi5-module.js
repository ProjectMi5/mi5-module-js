/**
 * Created by Dominik Serve on 15.06.2016.
 */

var simpleOpcua = require('mi5-simple-opcua');
var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Mi5Module, EventEmitter);
var connectionCount = 0;
 
var OpcuaServer = simpleOpcua.OpcuaServer;
var OpcuaClient = simpleOpcua.OpcuaClient;
//var OpcuaVariable = simpleOpcua.OpcuaVariable;


/**Mi5 Module inherits EventEmitter
 *
 * @param moduleName
 * @param {object} settings {opcua: {hostAddress: ..., baseNodeId: ...}, mqtt: ..., indPhysx: ...}
 * @constructor
 */

function Mi5Module(trivialName, settings){
  console.log('creating new module '+trivialName);
  EventEmitter.call(this);
  var self = this;

  this.trivialName = trivialName;
  // opcua
  this.baseNodeId = settings.opcua.baseNodeId;
  this.opcuaSettings = settings.opcua;
  this.opcuaServer = createOpcuaServer();
	this.opcuaClient = connectToOpcuaServer();
  // mqtt
  this.mqttSettings = settings.mqtt;
  this.mqttClient = connectToMQTTClient();
  // indPhysx
  this.indPhysxSettings = settings.indPhysx;
  // else
  this.simulateBehaviour = settings.simulateBehavior;
  this.behaviour = settings.behaviour;


  // functions

  function createOpcuaServer(){
    var opcuaSettings = self.opcuaSettings;
    if(!opcuaSettings){
      return null;
    }
    if(!opcuaSettings.server){
      return null;
    }
    // creating host ip
    opcuaSettings.hostAddress = "opc.tcp://" + require("os").hostname() + ":" + opcuaSettings.server.serverInfo.port;
    self.baseNodeId = opcuaSettings.server.baseNodeId;
    self.moduleName = opcuaSettings.server.moduleName;
    // starting server
    return OpcuaServer.newOpcuaServer(opcuaSettings.server);
  }

  function connectToOpcuaServer(){
    var opcuaSettings = self.opcuaSettings;
    console.log('connect to opcua server '+JSON.stringify(opcuaSettings.hostAddress));
    if(!opcuaSettings){
      return null;
    }
    connectionCount++;
    return new OpcuaClient(opcuaSettings.hostAddress, function(err){
      if(!err)
        newConnectionEstablished();
    });
  }

  function connectToMQTTClient(){
    var mqttSettings = self.mqttSettings;
    console.log('connect to mqtt broker '+JSON.stringify(mqttSettings));
    if(!mqttSettings){
      return null;
    }
    connectionCount++;
    var mqttClient = mqtt.connect(mqttSettings.hostAddress);
    mqttClient.on('connect', function(){
      console.log('connected to mqtt broker.');
      newConnectionEstablished();
    });
    mqttClient.on('error', console.log);
    return mqttClient;
  }

  function newConnectionEstablished(){
    connectionCount--;
    if(connectionCount == 0){
      console.log('All connections established successfully.');
      self.emit('connect');
    }
  }

}




module.exports = Mi5Module;