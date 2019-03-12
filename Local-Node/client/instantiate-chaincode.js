/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

'use strict';

var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('instantiate-chaincode');

var e2eUtils = require('./e2eUtils.js');
var testUtil = require('./util.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../config.json');

var chaincodeInstantiator = function() {

}
chaincodeInstantiator.prototype = {
  InstantiateChaincode: function(chaincodeID,fcn,args,cb) {
	e2eUtils.instantiateChaincode(chaincodeID, 'org1', configFile.chaincodePath, 'v0',false, fcn, args)
	.then((result) => {
		if(result){
      logger.info('Successfully instantiated chaincode on the channel');
      cb(null);
     return sleep(5000);
		}
		else {
      logger.error('Failed to instantiate chaincode ');
		}
	}, (err) => {
    logger.error('Failed to instantiate chaincode on the channel. ' + err.stack ? err.stack : err);
    cb(err);
	}).then(() => {
		logger.debug('Successfully slept 5s to wait for chaincode instantiate to be completed and committed in all peers');
	}).catch((err) => {
    logger.error('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
    cb(err);
	});
 }
}


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

exports.chaincodeInstantiator = chaincodeInstantiator
