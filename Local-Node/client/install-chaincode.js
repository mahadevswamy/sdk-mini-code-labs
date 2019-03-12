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
var logger = utils.getLogger('install-chaincode');

var e2eUtils = require('./e2eUtils.js');
var testUtil = require('./util.js');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../config.json');

var chaincodeInstaller = function() {

}
chaincodeInstaller.prototype = {
  InstallChaincode: function(chaincodeID, cb) {
	testUtil.setupChaincodeDeploy();
  logger.debug('\n============ Install chaincode on organizations ============\n')

	e2eUtils.installChaincode(chaincodeID, 'org1', configFile.chaincodePath, 'v0')
	.then(() => {
    logger.info('Successfully installed chaincode in peers of organization "org1"');
		return e2eUtils.installChaincode(chaincodeID,'org2', configFile.chaincodePath, 'v0');
	}, (err) => {
    logger.error('Failed to install chaincode in peers of organization "org1". ' + err.stack ? err.stack : err);
		return e2eUtils.installChaincode(chaincodeID,'org2', configFile.chaincodePath, 'v0');
	}).then(() => {
    logger.info('Successfully installed chaincode in peers of organization "org2"');
    cb(null);
    return;
	}, (err) => {
    logger.error('Failed to install chaincode in peers of organization "org2". ' + err.stack ? err.stack : err);
    cb(err);
    return;
	}).catch((err) => {
    logger.error('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
    cb(err);
    return;
	});
 }
}
exports.chaincodeInstaller = chaincodeInstaller
