"use strict"

var modules = require('./index.js');
var chaincodeInvoker = new modules.chaincodeInvoker();
var config = require('../config.json');

deploy();

function deploy(){

  console.log("Invoking your chaining...");

  var request = {
        chaincodeId : config.chaincodeId,
        fcn: config.invokeRequest.functionName,
        args: config.invokeRequest.args
    };

 chaincodeInvoker.InvokeChaincode(request, function(err) {
   if(err) {
    console.log("error in invoking chaincode: ", err.message);
     return;
   }
   console.log("Invoke chaincode successful");
 });
}


function getArgs(chaincodeArgs) {
  var args = [];
  for (var i = 0; i < chaincodeArgs.length; i++) {
    args.push(chaincodeArgs[i]);
  }
  return args;
}
