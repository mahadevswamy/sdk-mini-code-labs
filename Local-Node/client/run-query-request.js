"use strict"

var modules = require('./index.js');
var chaincodeQuery = new modules.chaincodeQuery();
var config = require('../config.json');

deploy();

function deploy(){

  console.log("query your chaining...");

  var request = {
        chaincodeId : config.chaincodeId,
        fcn: config.queryRequest.functionName,
        args: config.queryRequest.args
    };

    chaincodeQuery.QueryChaincode(request, function(err) {
       if(err) {
        console.log("error in invoking chaincode: ", err.message);
         return;
       }
       console.log("Query chaincode sucessful");
    });
}


function getArgs(chaincodeArgs) {
  var args = [];
  for (var i = 0; i < chaincodeArgs.length; i++) {
    args.push(chaincodeArgs[i]);
  }
  return args;
}
