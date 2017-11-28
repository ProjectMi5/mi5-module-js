const Mi5Module = require('./../models/mi5-module');
let module1 = new Mi5Module('module1',{port: 4841});
let skill1 = module1.addSkill('skill1');
let param1 = skill1.addInputParameter("distance", "Double", 2);
let param2 = skill1.addInputParameter("height", "Double", 2);
let param3 = skill1.addOutputParameter("weight", "Double", 2);
let variab = module1.addStateVariable("weight", "Double", 2);



module1.on("Idle", function(){
  console.log('You are now in idle mode');
});
module1.on("Resetting", function(){
  //
});

//let module2 = new Mi5Module('module2');

module1.onAny(function(event, value) {
  console.log('event: '+event, ' value: '+value);
});