'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var utils = require('fabric-client/lib/utils.js');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/EventHub.js');
var helper = require('./helper.js');
var logger = helper.getLogger('instantiate-chaincode');
hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = hfc.getConfigSetting('network-config');
var sleep = require('sleep');
var tx_id = null;
var nonce = null;
var adminUser = null;
var allEventhubs = [];
var isSuccess = null;
var q = require('q');
var config = require('../config.json');

var chaincodeInstantiator = function() {

}
chaincodeInstantiator.prototype = {
  InstantiateChaincode: function(chaincodeID, functionName, args, cb) {
    instantiateChaincode(chaincodeID, functionName, args, config.orgsList[0])
    .then(() => {
      cb(null);
    }, (err) => {
      logger.error('Failed to instantiate chaincode in peers of organization"'+ config.orgsList[0]+'". ' + err.stack ? err.stack : err);
      cb(err);
      return;
    }).catch((err) => {
      logger.error('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
      cb(err);
      return;
    });
 }
}

function instantiateChaincode(chaincodeID, functionName, args, org){


  var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

  var orgName = ORGS[org].name;
  var targets = [],
  	eventhubs = [];
  for (let key in ORGS) {
  	if (ORGS.hasOwnProperty(key) && key.indexOf('peer') === 0) {
  		let peer = new Peer(
  			ORGS[org][key].requests
  		);
      targets.push(peer);
  		// chain.addPeer(peer);

  		let eh = client.newEventHub();
  		eh.setPeerAddr(
  			ORGS[org][key].events
  		);
  		eh.connect();
  		eventhubs.push(eh);
  		allEventhubs.push(eh);
  	}
  }

console.log("channel - " + channel);
return helper.getOrgAdmin(org).then((user) => {
console.log("user - " + user);
  return channel.initialize();
}, (err) => {
console.log("Error :::");
  logger.error('Failed to enroll user \'admin\'. ' + err);
  throw new Error('Failed to enroll user \'admin\'. ' + err);
}).then((success) => {
console.log("SUCCESS :::");
  tx_id = client.newTransactionID();

  // send proposal to endorser
  var request = {
    chaincodePath: config.chaincodePath,
    chaincodeId: chaincodeID,
    chaincodeVersion: config.chaincodeVersion,
    fcn: functionName,
    args: [args],
    txId: tx_id,
  };
  return channel.sendInstantiateProposal(request);
}, (err) => {
  logger.error('Failed to initialize the channel');
  throw new Error('Failed to initialize the channel');
}).then((results) => {
  		var proposalResponses = results[0];
  		var proposal = results[1];
  		var header   = results[2];
  		var all_good = true;
  		for(var i in proposalResponses) {
  			let one_good = false;
  			if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
  				one_good = true;
  				logger.info('instantiate proposal was good');
  			} else {
  				logger.error('instantiate proposal was bad');
  			}
  			all_good = all_good & one_good;
  		}
  		if (all_good) {
  			logger.info(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
  			var request = {
  				proposalResponses: proposalResponses,
  				proposal: proposal,
  				header: header
  			};

  			// set the transaction listener and set a timeout of 30sec
  			// if the transaction did not get committed within the timeout period,
  			// fail the test
  			var deployId = tx_id.toString();

  			var eventPromises = [];
  			eventhubs.forEach((eh) => {
  				let txPromise = new Promise((resolve, reject) => {
  					let handle = setTimeout(reject, 30000);
  					eh.registerTxEvent(deployId.toString(), (tx, code) => {
  						logger.info('The chaincode instantiate transaction has been committed on peer '+ eh.ep._endpoint.addr);
  						clearTimeout(handle);
  						eh.unregisterTxEvent(deployId);
  						if (code !== 'VALID') {
  							logger.error('The chaincode instantiate transaction was invalid, code = ' + code);
  							reject();
  						} else {
  							logger.info('The chaincode instantiate transaction was valid.');
  							resolve();
  						}
  					});
  				});
  				eventPromises.push(txPromise);
  			});
  			var sendPromise = channel.sendTransaction(request);
  			return Promise.all([sendPromise].concat(eventPromises))
  			.then((results) => {
  				logger.debug('Event promise all complete and testing complete');
  				return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
  			}).catch((err) => {
  				logger.error('Failed to send instantiate transaction and get notifications within the timeout period.');
  				throw new Error('Failed to send instantiate transaction and get notifications within the timeout period.');
  			});
  		} else {
  			logger.error('Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...');
        logger.error(proposalResponses[0]);
        throw new Error(proposalResponses[0]);
  		}
  	}, (err) => {
  		logger.error('Failed to send instantiate proposal due to error: ' + err.stack ? err.stack : err);
  		throw new Error('Failed to send instantiate proposal due to error: ' + err.stack ? err.stack : err);
  	}).then((response) => {
  		if (response.status === 'SUCCESS') {
  			logger.info('Successfully sent transaction to the orderer.');
  			logger.debug('\n============ Chaincode Instantiateion is SUCCESS ============\n')
        for(var key in allEventhubs) {
          var eventhub = allEventhubs[key];
          if (eventhub && eventhub.isconnected()) {
            eventhub.disconnect();
          }
        }
  		} else {
  			logger.error('Failed to order the transaction. Error code: ' + response.status);
  			throw new Error('Failed to order the transaction. Error code: ' + response.status);
  		}
  	}, (err) => {
  		logger.error('Failed to send instantiate due to error: ' + err.stack ? err.stack : err);
  		throw new Error('Failed to send instantiate due to error: ' + err.stack ? err.stack : err);
  	});
}

exports.chaincodeInstantiator = chaincodeInstantiator
