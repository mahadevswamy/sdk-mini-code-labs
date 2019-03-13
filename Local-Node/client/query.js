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
var e2eUtils = require('./e2eUtils.js');
var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('chainwalk_query');
var chaincodeQuery = function() {

}
chaincodeQuery.prototype = {
  QueryChaincode: function(request, cb) {
	e2eUtils.queryChaincode(request, 'org2', 'v0')
	.then((result) => {
      logger.info('Successfully query chaincode on the channel');
      cb(null, result.toString('utf8'));
      return;
	}, (err) => {
		logger.error('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
    cb(err);
    return;
	}).catch((err) => {
		logger.error('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
		cb(err);
    return;
	});
 }
}
exports.chaincodeQuery = chaincodeQuery
