/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var Client = require('fabric-client');
var util = require('util');
var fs = require('fs');
var path = require('path');

var config = require('../config.json')
var helper = require('./helper.js');
var logger = helper.getLogger('Create-Channel');
Client.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = Client.getConfigSetting('network-config');
const utils = require('fabric-client/lib/utils.js');

createChannel();

function createChannel(){
  const caRootsPath = ORGS.orderer.tls_cacerts;
  const data = fs.readFileSync(path.join(__dirname, caRootsPath));
  const caroots = Buffer.from(data).toString();

  const client = new Client();

  var orderer = client.newOrderer(
		ORGS.orderer.url,
		{
			'pem': caroots,
			'ssl-target-name-override': ORGS.orderer['server-hostname']
		}
	);

  const signatures = [];

  // Acting as a client in org1 when creating the channel
  const org = ORGS.org1.name;

  utils.setConfigSetting('key-value-store', 'fabric-client/lib/impl/FileKeyValueStore.js');

  return Client.newDefaultKeyValueStore({
      path: helper.getKeyStoreForOrg(org)
    }).then((store) => {

      client.setStateStore(store);
      var cryptoSuite = Client.newCryptoSuite();
      cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: "/tmp/fabric-client-kvs_peerOrg1"}));
      client.setCryptoSuite(cryptoSuite);

      return helper.getAdminUser(config.orgsList[0]).then((user) => {

        var envelope_bytes = fs.readFileSync(path.join(__dirname, config.channelConfigurationTxn))
        const ch_config = client.extractChannelConfig(envelope_bytes);

        // client._userContext = null;

        let signature = client.signChannelConfig(ch_config);
        signatures.push(signature);
        signatures.push(signature);

        // const string_signature = signature.toBuffer().toString('hex');
        // collect signature from org1 admin
	      // signatures.push(string_signature);

        // signature = client.signChannelConfig(ch_config);

        const tx_id = client.newTransactionID();

        const request = {
    			config: ch_config,
    			signatures: signatures,
    			name: "mychannel",
    			// orderer: orderer_bad,
    			txId: tx_id
    		};
        // send to orderer
        return client.createChannel(request);
      });
    })
    .then((response) => {
      logger.debug(' response ::%j',response);

      if (response && response.status === 'SUCCESS') {
        logger.debug('Successfully created the channel.');
        return sleep(5000);
      } else {
        logger.error('Failed to create the channel. ');
        logger.debug('\n!!!!!!!!! Failed to create the channel \''+config.channelName+'\' !!!!!!!!!\n\n')
      }
    }, (err) => {
      logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
    })
    .then((nothing) => {
      logger.debug('Successfully waited to make sure channel \''+config.channelName+'\' was created.');
      logger.debug('\n====== Channel creation \''+config.channelName+'\' completed ======\n\n')
    }, (err) => {
      logger.error('Failed to sleep due to error: ' + err.stack ? err.stack : err);
    });
}
