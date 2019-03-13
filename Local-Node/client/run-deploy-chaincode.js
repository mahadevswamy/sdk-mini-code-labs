"use strict"

var modules = require('./index.js');
var chaincodeInstaller = new modules.chaincodeInstaller();
var chaincodeInstantiator = new modules.chaincodeInstantiator();
var config = require('../config.json');

deploy();

function deploy(){

  console.log("deploying your chaining...");

  var chaincodeID = config.chaincodeId;
  var functionName = config.deployRequest.functionName;

  var args = getArgs(config.deployRequest.args);

 chaincodeInstaller.InstallChaincode(chaincodeID, function(err) {
   if(err) {
    console.log("error in installing chaincode: ", err.message);
     return;
   }
   chaincodeInstantiator.InstantiateChaincode(chaincodeID, functionName, args, function(err) {
     if(err) {
      console.log("error in instantiating chaincode: ", err.message);
       return;
     }
     console.log("deploying chaincode sucessful");
   });
 });
}


function getArgs(chaincodeArgs) {
  var args = [];
  for (var i = 0; i < chaincodeArgs.length; i++) {
    args.push(chaincodeArgs[i]);
  }
  return args;
}
