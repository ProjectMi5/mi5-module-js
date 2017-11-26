const Mi5Module = require('./../models/mi5-module');
let module1 = new Mi5Module('module1',{port: 4841});
module1.on("Idle", function(){
  console.log('You are now in idle mode');
});
module1.on("Resetting", function(){
  //
})

//let module2 = new Mi5Module('module2');