var OpcuaVariable = require('mi5-simple-opcua').OpcuaVariable;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Parameter, EventEmitter);

const debug = require('debug');

function Parameter(Position, Name, Skill, settings){
  this.debug = debug('Mi5Module:'+Skill.Mi5Module.trivialName + ':'+ Skill.SkillName + ':'+ 'Parameter'+ Position);
  this.debug('initializing. Parameter: '+ Name);
  EventEmitter.call(this);

  var self = this;
  this.Position = Position;
  this.Skill = Skill;

  // settings
  if(!settings)
    settings = {}; // set settings to object, so that existence of settigs must not always be controlled

  var baseNodeIdInput = Skill.baseNodeIdInput + 'ParameterInput.ParameterInput' + Position + '.';
  var baseNodeIdOutput = Skill.baseNodeIdOutput + 'ParameterOutput.ParameterOutput' + Position + '.';

  //name
  this.Name = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Name', false, Name);

  // dummy
  this.Dummy = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Dummy', false, false);

  // id
  if(settings.ID)
    this.ID = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'ID', false, settings.ID);

  // default
  if(typeof settings.Default != 'undefined')
    this.Default = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Default', false, settings.Default);

  // required
  this.Required = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Required', false, false);
  if(typeof settings.Required != 'undefined' && settings.Required === false)
    this.Required.write(settings.Required);

  // maxvalue
  if(settings.MaxValue)
    this.MaxValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'MaxValue', false, settings.MaxValue);

  // minvalue
  if(settings.MinValue)
    this.MinValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'MinValue', false, settings.MinValue);

  // unit
  if(settings.Unit)
    this.Unit = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Unit', false, settings.Unit);

  // input
  this.StringValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdInput + 'StringValue', true);
  this.StringValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdInput + 'Value', true);
}

module.exports = Parameter;