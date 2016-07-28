/**
 * Created by Dominik Serve on 15.06.2016.
 */

var simpleOpcua = require('mi5-simple-opcua');
var mqtt = require('mqtt');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Mi5Module, EventEmitter);

var debug = require('debug');

var OpcuaServer = simpleOpcua.OpcuaServer;
var OpcuaClient = simpleOpcua.OpcuaClient;
var OpcuaHelper = simpleOpcua.helper;

var mi5Skill = require('./mi5-skill');
//var OpcuaVariable = simpleOpcua.OpcuaVariable;


/**Mi5 Module inherits EventEmitter
 *
 * @param moduleName
 * @param {object} settings {opcua: {hostAddress: ..., baseNodeId: ...}, mqtt: ..., indPhysx: ...}
 * @constructor
 */

function Mi5Module(trivialName, settings){
  //console.log(trivialName, 'creating new module');
  EventEmitter.call(this);
  var self = this;
  var item = this;

  this.debug = debug(trivialName);

  item.numberOfConnections = 0;
  this.trivialName = trivialName;
  this.moduleId = settings.moduleId;
  // opcua
  if(settings.opcua)
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

  // functions

  function createOpcuaServer(){
    var opcuaSettings = item.opcuaSettings;
    if(!opcuaSettings){
      return null;
    }
    if(!opcuaSettings.server){
      return null;
    }
    var serverStructure = opcuaSettings.server;

    // add default server structure
    if(serverStructure.content === "default"){
      serverStructure.content = {};
      serverStructure.content[serverStructure.moduleName] = {
        type: 'Folder',
        content: require("./../structure/folderStructure.json")
      };

      // add default init values
      if(!opcuaSettings.setInitValues){
        opcuaSettings.setInitValues = [];
      }
      if(opcuaSettings.server.outputName){
        opcuaSettings.setInitValues.push({
          path: serverStructure.moduleName+'.Output.Name',
          initValue: serverStructure.outputName
        });
      }
      if(opcuaSettings.server.outputId){
        opcuaSettings.setInitValues.push({
          path: serverStructure.moduleName+'.Output.ID',
          initValue: serverStructure.outputId
        });
      }
    }

    // make host address available for client
    opcuaSettings.hostAddress = "opc.tcp://" + require("os").hostname() + ":" + opcuaSettings.server.serverInfo.port;

    // adobt baseNodeId and moduleName for skills etc.
    self.baseNodeId = opcuaSettings.server.baseNodeId;
    self.moduleName = opcuaSettings.server.moduleName;

    // finish opcua server structure
    if(typeof opcuaSettings.expandRepeatUnits == 'undefined' || opcuaSettings.expandRepeatUnits == true){
      var expandFolderStructure = OpcuaHelper.expandFolderStructure;
      serverStructure.content = expandFolderStructure(serverStructure.content);
    }
    if(opcuaSettings.setInitValues){
      var setInitValues = OpcuaHelper.setInitValues;
      var initValueStatements = opcuaSettings.setInitValues;
      opcuaSettings.server.content = setInitValues(serverStructure.content, initValueStatements);
    }

    // starting server
    return OpcuaServer.newOpcuaServer(opcuaSettings.server);
  }

  function connectToOpcuaServer(){
    var opcuaSettings = self.opcuaSettings;
    if(!opcuaSettings){
      return null;
    }
    //self.log('connecting to opcua server '+JSON.stringify(opcuaSettings.hostAddress));
    item.numberOfConnections++;
    return new OpcuaClient(opcuaSettings.hostAddress, function(err){
      self.log('connected to opcua server');
      if(!err){
        newConnectionEstablished();
      }

    });
  }

  function connectToMQTTClient(){
    var mqttSettings = self.mqttSettings;

    if(!mqttSettings){
      return null;
    }
    self.log('connecting to mqtt broker '+mqttSettings.hostAddress);
    item.numberOfConnections++;
    var mqttClient = mqtt.connect(mqttSettings.hostAddress);
    mqttClient.on('connect', function(){
      self.log('connected to mqtt broker at '+mqttSettings.hostAddress);
      newConnectionEstablished();
    });
    mqttClient.on('error', console.log);
    return mqttClient;
  }

  function newConnectionEstablished(){
    item.numberOfConnections--;
    if(item.numberOfConnections == 0){
      self.log('All connections established successfully.');
      self.emit('connect');
      self.init = true;
    }
  }
}

Mi5Module.prototype.createSkill = function(SkillNumber, SkillName, SkillId, settings){
  var self = this;
  if(self.init)
    append();
  else
    self.once('connect', append);

  function append(){
    var skill = new mi5Skill(SkillNumber, SkillName, SkillId, self, settings);
    this[SkillName] = skill
  }
};

Mi5Module.prototype.log = function(message){
  this.debug(message);
};

module.exports = Mi5Module;