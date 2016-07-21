var OpcuaVariable = require('mi5-simple-opcua').OpcuaVariable;
var SkillParameter = reqire('./mi5-skill-parameter');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Skill, EventEmitter);

const debug = require('debug');

function Skill(SkillNumber, SkillName, SkillID, Mi5Module, settings){
  this.debug = debug('Mi5Module:'+Mi5Module.trivialName + ':'+ SkillName);
  this.debug('initializing. SkillNumber: '+ SkillNumber + ' SkillID: ' + SkillID);
  EventEmitter.call(this);
  var self = this;
  this.SkillNumber = SkillNumber;
  this.SkillName = SkillName;
  this.SkillID = SkillID;
  this.Mi5Module = Mi5Module;

  // settings
  if(!settings)
    settings = {}; // set settings to object, so that existence of settigs must not always be controlled
  this.settings = settings;

  // default behaviour
  this.behaviour = {
    simulate: false,
    timers: {
      finishTask: 2000,
      setDone: 3000
    }
  };

  // module settings can override default behaviour
  if(Mi5Module.simulateBehaviour)
    this.behaviour.simulate = Mi5Module.simulateBehaviour;
  if(Mi5Module.timers)
    this.behaviour.timers = Mi5Module.timers;

  // Skill settings can override module settings
  if(typeof settings.simulateBehaviour != 'undefined')
    this.behaviour.simulate = settings.simulateBehaviour;
  if(settings.timers)
    this.behaviour.timers = settings.timers;
  this.behaviour.doneEvent = settings.doneEvent;
  this.behaviour.listenToMqttTopic = settings.listenToMqttTopic;

  //baseNodeId handling
	var endOfBaseNodeId = Mi5Module.baseNodeId.split('').pop();
  var dot = '.';
  if(endOfBaseNodeId === '.'){
    dot = '';
  }
	
	var baseNodeIdInput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Input.SkillInput.SkillInput' + SkillNumber + '.';
  this.baseNodeIdInput = baseNodeIdInput;
	var baseNodeIdOutput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Output.SkillOutput.SkillOutput' + SkillNumber + '.';
  this.baseNodeIdOutput = baseNodeIdOutput;

  // adding skill to opcua server
  if(SkillID){
    this.SkillIDVariable = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'ID', false, SkillID);
    this.SkillDummyValue = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Dummy', false, false);
    this.SkillNameVariable = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Name', false, SkillName);
  } else {
    console.error('This Skill needs an ID.');
  }

  // adding skill state variables
	this.execute	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdInput + 'Execute');
	this.ready	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Ready');
	this.busy	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Busy');
	this.done	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Done');
	this.error    =  new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Error');

  // adding parameters
  if(settings.parameters){
    self.parameter = {};
    settings.parameters.forEach(function(item, index, array){
      if(item.Position)
        index = item.Position;
      self.parameter[item.Name] = new SkillParameter(index, item.Name, self, item.settings);
    });
  }


  // implement behaviour
  if(this.behaviour.simulate){
    self.execute.onChange(function(value){
      self.log('execute ' + value);

      if(value){
        self.simulateBehaviour(self.behaviour.timers, self.behaviour.doneEvent);
      }
    });

    self.error.onChange(function(value){
      self.log('error ' + value);
      self.setError(value);
    });
  }

  if(this.behaviour.listenToMqttTopic){
    Mi5Module.mqttClient.subscribe(self.behaviour.listenToMqttTopic);
    self.mqttSensor = false;
    Mi5Module.mqttClient.on('message', function (topic, message) {
      // message is Buffer
      if(topic != self.behaviour.listenToMqttTopic)
        return;
      message = message.toString();
      self.log('sensor says: '+message);
      var newValue = JSON.parse(message);
      if(self.mqttSensor != newValue){
        self.log('new value');
        if(newValue){
          self.emit('mqttSensorTurnedTrue');
        } else {
          self.emit('mqttSensorTurnedFalse');
        }
      }
      self.sensor = newValue;
    });
  }
}

Skill.prototype.simulateBehaviour = function(timers, doneEvent){
  var self = this;
  if(!self.ready.value){
    self.log(self.ready.value);
    self.log('Not ready. Try again.');
    return;
  }
  self.setBusy();
  if(self.behaviour.listenToMqttTopic){
    if(self.mqttSensor)
      runThroughStates();
    else
      self.once('mqttSensorTurnedTrue', runThroughStates);
  }
  else if(self.behaviour.doneEvent){
    self.once(doneEvent, runThroughStates);
  } else {
    runThroughStates();
  }

  function runThroughStates(){
    setTimeout(function(){
      self.finishTask();
    },timers.finishTask);
    setTimeout(function(){
      self.setDone()
    },timers.setDone);
	if(timers.setReady){
		setTimeout(function(){
		  self.setReady()
		},timers.setReady);
	} else {
    setTimeout(function(){
      self.setReadyWhenExecuteIsReset();
    }, timers.setDone);
  }

  }
};

Skill.prototype.log = function(message){
  this.debug(message);
};


Skill.prototype.setBusy = function(){
  var self = this;
  self.log('set busy.');
  self.done.write(false);
  self.busy.write(true);
  self.ready.write(false);
  /*writeToIndPhysix("status_self.busy","TRUE");
  writeToIndPhysix("status_self.ready","FALSE");
  writeToIndPhysix("status_self.done","FALSE");*/
};

Skill.prototype.finishTask = function(){
  var self = this;
  self.log('finished its task.');
  self.busy.write(false);
  //writeToIndPhysix("status_self.busy","FALSE");
};

Skill.prototype.setDone = function(){
  var self = this;
  self.log('set done.');
  self.done.write(true);
  //writeToIndPhysix("status_self.done","TRUE");
};

Skill.prototype.setReadyWhenExecuteIsReset = function(){
  var self = this;
  self.execute.oneChange(function(value){
    if(!value){
      self.setReady();
    } else {
      self.setReadyWhenExecuteIsReset();
    }
  });
};

Skill.prototype.setReady = function(){
  var self = this;
  self.log('set ready.');
  self.busy.write(false);
  self.ready.write(true);
  self.done.write(false);
  /*writeToIndPhysix("status_self.busy","FALSE");
  writeToIndPhysix("status_self.ready","TRUE");
  writeToIndPhysix("status_self.done","FALSE");*/
};

Skill.prototype.setError = function(value){
  var self = this;
  if(value){
    //writeToIndPhysix("status_self.error","TRUE");
  }
  else {
    //writeToIndPhysix("status_self.error","FALSE");
  }
};

Skill.prototype.setError = function(value){
  var self = this;
  if(value){
    //writeToIndPhysix("status_self.error","TRUE");
  }
  else {
    //writeToIndPhysix("status_self.error","FALSE");
  }
};

/*function writeToIndPhysix(variableName,value){
  // SkillNumber+1 equals pump number for Cocktail Module
  var outputString = 'setIOValue("' + indPhysxSkillPath + '","' + variableName + '","' + value + '");';
  Mi5Module.indPhysxClient.write(outputString);
  //self.log(outputString);
}*/

module.exports = Skill;

