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
  this.initialized = false;

  // settings
  if(!settings)
    settings = {}; // set settings to object, so that existence of settigs must not always be controlled

  var baseNodeIdInput = Skill.baseNodeIdInput + 'ParameterInput.ParameterInput' + Position + '.';
  var baseNodeIdOutput = Skill.baseNodeIdOutput + 'ParameterOutput.ParameterOutput' + Position + '.';

  if(this.Skill.initialized){
    initialize();
  } else {
    this.Skill.once('init', initialize);
  }

  function initialize(){
    //name
    self.Name = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Name', false, Name);

    // dummy
    self.Dummy = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Dummy', false, false);

    // id
    if(settings.ID)
      self.ID = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'ID', false, settings.ID);

    // default
    if(typeof settings.Default != 'undefined')
      self.Default = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Default', false, settings.Default);

    // required
    self.Required = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Required', false, false);
    if(typeof settings.Required != 'undefined' && settings.Required === false)
      this.Required.write(settings.Required);

    // maxvalue
    if(settings.MaxValue)
      self.MaxValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'MaxValue', false, settings.MaxValue);

    // minvalue
    if(settings.MinValue)
      self.MinValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'MinValue', false, settings.MinValue);

    // unit
    if(settings.Unit)
      self.Unit = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdOutput + 'Unit', false, settings.Unit);

    // input
    self.StringValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdInput + 'StringValue', true);
    self.StringValue = new OpcuaVariable(Skill.Mi5Module.opcuaClient, baseNodeIdInput + 'Value', true);

    self.initialized = true;
    self.emit('init');
  }
}

module.exports = Parameter;