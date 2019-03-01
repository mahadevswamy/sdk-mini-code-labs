'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var utils = require('fabric-client/lib/utils.js');
var Peer = require('fabric-client/lib/Peer.js');
var helper = require('./helper.js');
var logger = helper.getLogger('install-chaincode');
hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = hfc.getConfigSetting('network-config');
var tx_id = null;
var nonce = null;
var adminUser = null;
var q = require('q');
var config = require('../config.json');

var chaincodeInstaller = function() {

}

chaincodeInstaller.prototype = {
  InstallChaincode: function(chaincodeID, cb) {
		helper.setupChaincodeDeploy();
			logger.debug('\n============ Install chaincode on organizations ============\n')
			installChaincode(chaincodeID, config.orgsList[0])
			.then(() => {
				logger.info('Successfully installed chaincode in peers of organization "'+config.orgsList[0]+'"');
        return installChaincode(chaincodeID,config.orgsList[1]);
			}, (err) => {
				logger.error('Failed to install chaincode in peers of organization"'+config.orgsList[0]+'". ' + err.stack ? err.stack : err);
        cb(err);
        return;
			}).then(() => {
		logger.info('Successfully installed chaincode in peers of organization "'+config.orgsList[1]+'"');
      cb(null);
      return;
	}, (err) => {
		logger.error('Failed to install chaincode in peers of organization "'+config.orgsList[1]+'". ' + err.stack ? err.stack : err);
    cb(err);
    return;
	}).catch((err) => {
				logger.error('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        cb(err);
        return;
			});
   }
}

function installChaincode(chaincodeID, org) {

  helper.setupChaincodeDeploy();
	var channel = helper.getChannelForOrg(org);
	var client = helper.getClientForOrg(org);

	var orgName = ORGS[org].name;
	var targets = [];
	for (let key in ORGS[org]) {
		if (ORGS[org].hasOwnProperty(key)) {
			if (key.indexOf('peer') === 0) {
				let peer = new Peer(
					ORGS[org][key].requests
				);
				targets.push(peer);
			}
		}
	}
	return helper.getOrgAdmin(org).then((user) => {

    // send proposal to endorser
    var request = {
      targets: targets,
      chaincodePath: config.chaincodePath,
      chaincodeId: chaincodeID,
      chaincodeVersion: config.chaincodeVersion,
      txId: tx_id,
      nonce: nonce
    };
    return client.installChaincode(request);
  }, (err) => {
		logger.error('Failed to enroll user \'admin\'. ' + err);
		throw new Error('Failed to enroll user \'admin\'. ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var header   = results[2];
		var all_good = true;
		for(var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
				one_good = true;
				logger.info('install proposal was good');
			} else {
				logger.error('install proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			logger.info(util.format('Successfully sent install Proposal and received ProposalResponse: Status - %s', proposalResponses[0].response.status));
			logger.debug('\n============ Install chaincode on organizations COMPLETED ============\n');
		} else {
			logger.error('Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...');
      logger.error(proposalResponses[0]);
      throw new Error(proposalResponses[0]);
		}
	},
	(err) => {
		logger.error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
		throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
	});
}

exports.chaincodeInstaller = chaincodeInstaller
