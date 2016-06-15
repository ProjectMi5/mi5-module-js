var OpcuaVariable = require('mi5-simple-opcua').OpcuaVariable;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Skill, EventEmitter);

function Skill(SkillNumber, SkillName, Mi5Module){
  console.log('Skill init '+ SkillNumber + ' ' + SkillName);
  EventEmitter.call(this);
  var self = this;
  this.skillNumber = SkillNumber;
  this.skillName = SkillName;

	var endOfBaseNodeId = Mi5Module.baseNodeId.split('').pop();
  var dot = '.';
  if(endOfBaseNodeId === '.'){
    dot = '';
  }
	
	var baseNodeIdInput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Input.SkillInput.SkillInput' + SkillNumber + '.';
	var baseNodeIdOutput = Mi5Module.baseNodeId + dot + Mi5Module.moduleName + '.Output.SkillOutput.SkillOutput' + SkillNumber + '.';

	this.execute	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdInput + 'Execute');
	this.ready	 =	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Ready');
	this.busy	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Busy');
	this.done	 = 	new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Done');
	this.error    =  new OpcuaVariable(Mi5Module.opcuaClient, baseNodeIdOutput + 'Error');

  if(Mi5Module.simulate){
    this.execute.onChange(function(value){
      console.log('Skill'+self.skillNumber+', '+self.skillName+': execute ' + value);
      var timers = {
        finishTask: 2000,
        setDone: 3000,
        setReady: 4000
      };
      if(Mi5Module.behavior){
        timers = Mi5Module.behavior;
      }
      if(value){
        self.setBusy();
        setTimeout(function(){
          self.finishTask();
        },timers.finishTask);
        setTimeout(function(){
          self.setDone()
        },timers.setDone);
        setTimeout(function(){
          self.setReady()
        },timers.setReady);
      }
    });

    this.error.onChange(function(value){
      console.log('Skill'+self.skillNumber+', '+self.skillName+': error ' + value);
      self.setError(value);
    });
  }
}


Skill.prototype.setBusy = function(){
  var self = this;
  console.log('Skill'+self.skillNumber+', '+self.skillName+': set busy.');
  self.done.write(false);
  self.busy.write(true);
  self.ready.write(false);
  /*writeToIndPhysix("status_self.busy","TRUE");
  writeToIndPhysix("status_self.ready","FALSE");
  writeToIndPhysix("status_self.done","FALSE");*/
};

Skill.prototype.finishTask = function(){
  var self = this;
  console.log('Skill'+self.skillNumber+', '+self.skillName+': finished its task.');
  self.busy.write(false);
  //writeToIndPhysix("status_self.busy","FALSE");
};

Skill.prototype.setDone = function(){
  var self = this;
  console.log('Skill'+self.skillNumber+', '+self.skillName+': set done.');
  self.done.write(true);
  //writeToIndPhysix("status_self.done","TRUE");
};

Skill.prototype.setReady = function(){
  var self = this;
  console.log('Skill'+self.skillNumber+', '+self.skillName+': set ready.');
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
  //console.log(outputString);
}*/

module.exports = Skill;

