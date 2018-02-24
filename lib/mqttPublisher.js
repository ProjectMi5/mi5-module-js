const mqtt = require('mqtt');


function publish(modules, endpointUrl, stateTranslations = {}){
  let client = mqtt.connect(endpointUrl);

  /**
   * Explanation of mqtt topics publishing the current states:
   * topic: 'mi5/{moduleName}/state/{currentStateName}', message: null
   * topic: 'mi5/{moduleName}/skill/{skillName}/state/{currentStateName}, message: JSON of inputParameters
   */
  modules.forEach((module) => {
    module.onAny(function(event, value) {
      client.subscribe('mi5/'+module.name+'/#');
      client.publish('mi5/'+module.name+'/state/'+translateEvent(event), JSON.stringify(value));
    });
    module.skills.forEach((skill) => {
      skill.onAny((event, value) => {
        let parameters = {};
        skill.inputParameters.forEach((parameter) => {
          parameters[parameter.name] = parameter.getValue();
        });
        client.publish('mi5/'+module.name+'/skill/'+skill.name+'/state/'+translateEvent(event), JSON.stringify(parameters));
      });
    });

    function translateEvent(event){
      let translation = stateTranslations[event];
      if(typeof translation === 'undefined')
        return event;
      else
        return translation;
    }
  });

  /**
   * Explanation for mqtt topics and messages corresponding to their javascript programming equivalent
   * module.done(): topic 'mi5/{moduleName}/done', message: null
   * module.error(message): topic 'mi5/{moduleName}/error', message: {//tbd}
   * stateVariable.setValue(value): topic 'mi5/{moduleName}/property/{propertyName}', message: value.toString();
   * skill.done(): topic 'mi5/{moduleName}/skill/done', message: null
   * skill.error(message: topic 'mi5/{moduleName}/skill/{skillName}/error', message: {//tbd}
   * skillOutputParameter.setValue(value): topic 'mi5/{moduleName}/skill/{skillName}/outputParameter/{parameterName}', message: value.toString();
   */
  client.on('message', function (topic, message) {
    // message is Buffer
    let top = topic.split('/');
    top.reverse();

    // check if first top is correct
    if(top.pop() !== 'mi5')
      return;

    // get module (second top)
    let moduleName = top.pop();
    let module;
    for(let i = 0; i < modules.length; i++){
      if(modules[i].name === moduleName)
        module = modules[i];
    }
    if(!module)
      return;

    // third top
    let nextTopic = top.pop();
    if(nextTopic === 'done')
      return module.done();
    if(nextTopic === 'property')
      return setProperty(module, top, message.toString());
    if(nextTopic === 'error')
      return; //TODO: implement error display
    if(nextTopic !== 'skill')
      return;

    // skills
    let skillName = top.pop();
    let skill = module.getSkill(skillName);
    if(!skill)
      return;
    nextTopic = top.pop();
    if(nextTopic === 'done')
      return skill.done();
    if(nextTopic === 'error')
      return; //TODO: implement error display
    if(nextTopic === 'outputParameter')
      return setOutputParameter(skill, top, message.toString());
  });

  return client;
}

function setProperty(module, top, value){
  let property = top.pop();
  let varble = module.getStateVariable(property);
  if(!varble)
    return;
  varble.setValue(value);
}

function setOutputParameter(skill, top, value){
  let property = top.pop();
  let varble = skill.getOutputParameter(property);
  if(!varble)
    return;
  varble.setValue(value);
}

module.exports = publish;