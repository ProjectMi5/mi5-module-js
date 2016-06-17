var OpcuaVariable = require('mi5-simple-opcua').OpcuaVariable;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Skill, EventEmitter);

function Skill(SkillNumber, SkillName, Mi5Module, settings){
  console.log('Skill init '+ SkillNumber + ' ' + SkillName);
  EventEmitter.call(this);
  var self = this;
  this.skillNumber = SkillNumber;
  this.skillName = SkillName;
  this.Mi5Module = Mi5Module;

  // settings
  this.settings = settings;
  if(!settings)
    settings = {}; // set settings to object, so that existence of settigs must not always be controlled

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
  // skill settings can override module settings
  if(typeof settings.simulateBehaviour != 'undefined')
    this.behaviour.simulate = settings.simulateBehaviour;
  if(settings.timers)
    this.behaviour.timers = settings.timers;
  this.behaviour.doneEvent = settings.doneEvent;
  this.behaviour.listenToMqttTopic = settings.listenToMqttTopic;

	var endOfBaseNodeId = Mi5Module.baseNodeId.split('').pop();
  var dot = '.';
  if(endOfBaseNodeId === '.'){
    dot = '';
  }
	
	var baseNodeIdInput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Input.SkillInput.SkillInput' + SkillNumber + '.';
	var baseNodeIdOutput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Output.SkillOutput.SkillOutput' + SkillNumber + '.';

  if(settings.skillID){
    this.skillIDVariable = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'ID');
    this.skillIDVariable.write(settings.skillID);
    this.skillDummyValue = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Dummy');
    this.skillDummyValue.write(false);
    this.skillNameVariable = new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Name');
    this.skillNameVariable.write(SkillName);
  }

	this.execute	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdInput + 'Execute');
	this.ready	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Ready');
	this.busy	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Busy');
	this.done	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Done');
	this.error    =  new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Error');

  if(this.behaviour.simulate){
    self.execute.onChange(function(value){
      console.log('Skill'+self.skillNumber+', '+self.skillName+': execute ' + value);

      if(value){
        self.simulateBehaviour(self.behaviour.timers, self.behaviour.doneEvent);
      } else {
		self.setReady();
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
	}

  }
};

Skill.prototype.log = function(message){
  var self = this;
  console.log(self.Mi5Module.trivialName + ': Skill ' + self.skillNumber+', '+self.skillName + ': ' + message);
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

/*function writeToIndPhysix(variableName,value){
  // SkillNumber+1 equals pump number for Cocktail Module
  var outputString = 'setIOValue("' + indPhysxSkillPath + '","' + variableName + '","' + value + '");';
  Mi5Module.indPhysxClient.write(outputString);
  //self.log(outputString);
}*/

module.exports = Skill;

