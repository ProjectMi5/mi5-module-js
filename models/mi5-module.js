/**
 * Created by Dominik Serve on 15.06.2016.
 */

var simpleOpcua = require('mi5-simple-opcua');
var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Mi5Module, EventEmitter);
 
var OpcuaServer = simpleOpcua.OpcuaServer;
var OpcuaClient = simpleOpcua.OpcuaClient;

var mi5Skill = require('./mi5-skill');
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
  this.moduleId = settings.moduleId;
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
  this.simulateBehaviour = settings.simulateBehaviour;
  this.behaviour = settings.behaviour;
  this.init = false;
  this.numberOfSkills = 0;
  this.connectionCount = 0;

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
    if(!opcuaSettings){
      return null;
    }
	self.log('connecting to opcua server '+JSON.stringify(opcuaSettings.hostAddress));
    self.connectionCount++;
    console.log(self.connectionCount);
    return new OpcuaClient(opcuaSettings.hostAddress, function(err){
      self.log('connected to opcua server'+err);
      if(!err)
        newConnectionEstablished();
    });
  }

  function connectToMQTTClient(){
    var mqttSettings = self.mqttSettings;
   
    if(!mqttSettings){
      return null;
    }
	self.log('connecting to mqtt broker '+mqttSettings.hostAddress);
    self.connectionCount++;
    var mqttClient = mqtt.connect(mqttSettings.hostAddress);
    mqttClient.on('connect', function(){
      self.log('connected to mqtt broker at '+mqttSettings.hostAddress);
      newConnectionEstablished();
    });
    mqttClient.on('error', console.log);
    return mqttClient;
  }

  function newConnectionEstablished(){
    self.connectionCount--;
    if(self.connectionCount == 0){
      self.log('All connections established successfully.');
      self.emit('connect');
      self.init = true;
    }
  }
}

Mi5Module.prototype.createSkill = function(SkillNumber, SkillName, settings){
  var self = this;
  if(self.init)
    append();
  else
    self.once('connect', append);

  function append(){
    var skill = new mi5Skill(SkillNumber, SkillName, self, settings);
    this[SkillName] = skill
  }
};

Mi5Module.prototype.log = function(message){
  var self = this;
  console.log('Module ' + self.trivialName + ': ' + message);
};

module.exports = Mi5Module;