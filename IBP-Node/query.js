/*
 Copyright 2018 IBM All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*
 * Chaincode query
 */
'use strict';

var Fabric_Client = require('fabric-client');
var path = require('path');
var creds = require('./creds.json');

var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('defaultchannel');
var peer = fabric_client.newPeer(creds.peers['org1-peer1'].url, { pem: creds.peers['org1-peer1'].tlsCACerts.pem, 'ssl-target-name-override': null });
channel.addPeer(peer);

var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({
  path: store_path
}).then((state_store) => {
  // assign the store to the fabric client
  fabric_client.setStateStore(state_store);
  var crypto_suite = Fabric_Client.newCryptoSuite();
  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
  crypto_suite.setCryptoKeyStore(crypto_store);
  fabric_client.setCryptoSuite(crypto_suite);

  // get the enrolled user from persistence, this user will sign all requests
  return fabric_client.getUserContext('user1', true);
}).then((user_from_store) => {
  if (user_from_store && user_from_store.isEnrolled()) {
    console.log('Successfully loaded user3 from persistence');
    member_user = user_from_store;
  } else {
    throw new Error('Failed to get user1.... run registerUser.js');
  }


const request = {
      chaincodeId: 'fabcarcc',
      fcn: 'queryAllCars',
      args: ['']
  };




  // send the query proposal to the peer
  return channel.queryByChaincode(request);
}).then((query_responses) => {
  console.log('Query has completed, checking results');
  // query_responses could have more than one  results if there multiple peers were used as targets
  if (query_responses && query_responses.length == 1) {
    if (query_responses[0] instanceof Error) {
      console.error('error from query = ', query_responses[0]);
    } else {
      console.log('Response is ', query_responses[0].toString());
    }
  } else {
    console.log('No payloads were returned from query');
  }
}).catch((err) => {
  console.error('Failed to query successfully :: ' + err);
});
