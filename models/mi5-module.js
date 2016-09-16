/**
 * Created by Dominik Serve on 15.06.2016.
 */

var simpleOpcua = require('mi5-simple-opcua');
var mqtt = require('mqtt');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Mi5Module, EventEmitter);

var debug = require('debug');

var OpcuaServer = simpleOpcua.OpcuaServer;
var OpcuaClient = simpleOpcua.OpcuaClient;
var OpcuaHelper = simpleOpcua.helper;
var OpcuaVariable = simpleOpcua.OpcuaVariable;

var mi5Skill = require('./mi5-skill');





/**Mi5 Module inherits EventEmitter
 *
 * @param moduleName
 * @param {object} settings {opcua: {hostAddress: ..., baseNodeId: ...}, mqtt: ..., indPhysx: ...}
 * @constructor
 */

function Mi5Module(trivialName, settings){
  //console.log(trivialName, 'ceating new module');
  EventEmitter.call(this);
  var self = this;
  var item = this;

  this.debug = debug(trivialName);

  if(settings.storage){
    settings.storage = settings.storage.replace('.', process.cwd());
    this.storage = require('node-persist');
    this.storage.initSync({
      dir: settings.storage,
      stringify: JSON.stringify,
      parse: JSON.parse,
      encoding: 'utf8',
      logging: false,  // can also be custom logging function
      continuous: true,
      interval: false,
      ttl: false // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
    })/*.then(function(){self.emit()}, function(){console.log('no success')})*/;
  }

  item.numberOfConnections = 0;
  this.skills = [];
  this.trivialName = trivialName;
  this.moduleId = settings.moduleId;
  this.position = -1;
  if(typeof settings.position != 'undefined')
    this.position = settings.position;
  if(self.storage && self.storage.getItem(self.trivialName + ' position'))
    this.position = self.storage.getItem(self.trivialName + ' position');

  // opcua
  if(settings.opcua){
    //baseNodeId handling
    if(settings.opcua.baseNodeId)
      createNodeIds(settings.opcua.baseNodeId);
  }

  function createNodeIds(baseNodeId){
    self.baseNodeId = baseNodeId;
    // baseNodeId handling
    var endOfBaseNodeId = self.baseNodeId.split('').pop();
    var dot = '.';
    if(endOfBaseNodeId === '.'){
      dot = '';
    }
    self.baseNodeIdModule = self.baseNodeId + dot + self.moduleName + '.';
    self.baseNodeIdInput = self.baseNodeIdModule + 'Input.';
    self.baseNodeIdOutput = self.baseNodeIdModule + 'Output.';
  }

  this.opcuaSettings = settings.opcua;
  this.opcuaServer = createOpcuaServer();
  this.opcuaClient = connectToOpcuaServer();
  // mqtt
  this.mqttSettings = settings.mqtt;
  this.mqttClient = connectToMQTTClient();
  // indPhysx
  this.indPhysxSettings = settings.indPhysx;
  this.indPhysxClient = connectToIndPhysx();
  // else
  this.simulateBehaviour = settings.simulateBehaviour;
  this.behaviour = settings.behaviour;
  this.initialized = false;
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
    self.moduleName = opcuaSettings.server.moduleName;
    createNodeIds(opcuaSettings.server.baseNodeId);

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
      // create variables
      self.reset = new OpcuaVariable(self.opcuaClient, self.baseNodeIdModule + 'reset');
      self.ConnectionTestInput = new OpcuaVariable(self.opcuaClient, self.baseNodeIdInput + 'ConnectionTestInput');
      self.ConnectionTestOutput = new OpcuaVariable(self.opcuaClient, self.baseNodeIdOutput + 'ConnectionTestOutput', false);
      self.PositionInput = new OpcuaVariable(self.opcuaClient, self.baseNodeIdInput + 'PositionInput');
      self.PositionOutput = new OpcuaVariable(self.opcuaClient, self.baseNodeIdOutput + 'PositionOutput', false, self.position);
      // backend logic
      self.reset.onChange(function(value){
        if(value){
          self.emit('reset');
        }
      });
      self.ConnectionTestInput.onChange(function(value){
        self.ConnectionTestOutput.write(value);
      });
      self.PositionInput.onChange(function(value){
        var position = value;
        if(settings.positionOffset)
          position += settings.positionOffset;
        self.PositionOutput.write(position);
        self.storage.setItem(self.trivialName+' position', position);
      });


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

  function connectToIndPhysx(){
    if(!self.indPhysxSettings)
      return null;
    var indPhysxClient = net.connect({host: self.indPhysxSettings.host, port: self.indPhysxSettings.port}, function(){
        console.log("Connected to indPhysx server.");
    });
    indPhysxClient.on('error', function(exception){
      console.error("Connection to industrialPhysics: "+exception+"\ntrying to reconnect in 5 sec.");
      self.indPhysxClient = null;
      setTimeout(connectToIndPhysx, 5000);
    });
    return indPhysxClient;
  }

  function newConnectionEstablished(){
    item.numberOfConnections--;
    if(item.numberOfConnections == 0){
      self.log('All connections established successfully.');
      self.emit('connect');
      self.initialized = true;
    }
  }
}

Mi5Module.prototype.createSkill = function(SkillNumber, SkillName, SkillId, settings){
  var self = this;
  var skill = new mi5Skill(SkillNumber, SkillName, SkillId, self, settings);
  this[SkillName] = skill;
  this.skills.push(SkillName);
  return skill;
};

Mi5Module.prototype.resetSkills = function(){
  var self = this;
  this.skills.forEach(function(skillName){
    self[skillName].reset();
  });
};

Mi5Module.prototype.log = function(message){
  this.debug(message);
};

Mi5Module.prototype.writeToIndPhysix = function(variableName,value){
  // SkillNumber+1 equals pump number for Cocktail Module
  var self = this;
  var indPhysxSettings = this.indPhysxSettings;
  var indPhysxClient = this.indPhysxClient;
  if(!indPhysxClient)
    return;
  var outputString = 'setIOValue("' + indPhysxSettings.modulePath + '","' + variableName + '","' + value + '");';
  indPhysxClient.write(outputString);
};

module.exports = Mi5Module;