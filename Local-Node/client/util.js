var path = require('path');
var fs = require('fs-extra');
var os = require('os');
var util = require('util');

var jsrsa = require('jsrsasign');
var KEYUTIL = jsrsa.KEYUTIL;

var Client = require('fabric-client');
var copService = require('fabric-ca-client/lib/FabricCAClientImpl.js');
var User = require('fabric-client/lib/User.js');
var CryptoSuite = require('fabric-client/lib/impl/CryptoSuite_ECDSA_AES.js');
var KeyStore = require('fabric-client/lib/impl/CryptoKeyStore.js');
var ecdsaKey = require('fabric-client/lib/impl/ecdsa/key.js');
var Constants = require('./constants.js');

var logger = require('fabric-client/lib/utils.js').getLogger('TestUtil');
var reload = require('require-reload')(require),
    configFile = reload(__dirname + '/../config.json');

// all temporary files and directories are created under here
var tempdir = Constants.tempdir;

logger.info(util.format(
	'\n\n*******************************************************************************' +
	'\n*******************************************************************************' +
	'\n*                                          ' +
	'\n* Using temp dir: %s' +
	'\n*                                          ' +
	'\n*******************************************************************************' +
	'\n*******************************************************************************\n', tempdir));

module.exports.getTempDir = function() {
	fs.ensureDirSync(tempdir);
	return tempdir;
};

// directory for file based KeyValueStore
module.exports.KVS = path.join(tempdir, 'hfc-test-kvs');
module.exports.storePathForOrg = function(org) {
	return module.exports.KVS + '_' + org;
};

// temporarily set $GOPATH to the test fixture folder
module.exports.setupChaincodeDeploy = function() {
	process.env.GOPATH = path.join(__dirname, configFile.GOPATH);
};

// specifically set the values to defaults because they may have been overridden when
// running in the overall test bucket ('gulp test')
module.exports.resetDefaults = function() {
	global.hfc.config = undefined;
	require('nconf').reset();
};

module.exports.cleanupDir = function(keyValStorePath) {
	var absPath = path.join(process.cwd(), keyValStorePath);
	var exists = module.exports.existsSync(absPath);
	if (exists) {
		fs.removeSync(absPath);
	}
};

module.exports.getUniqueVersion = function(prefix) {
	if (!prefix) prefix = 'v';
	return prefix + Date.now();
};

// utility function to check if directory or file exists
// uses entire / absolute path from root
module.exports.existsSync = function(absolutePath /*string*/) {
	try  {
		var stat = fs.statSync(absolutePath);
		if (stat.isDirectory() || stat.isFile()) {
			return true;
		} else
			return false;
	}
	catch (e) {
		return false;
	}
};

module.exports.readFile = readFile;

Client.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = Client.getConfigSetting('network-config');

var	tlsOptions = {
	trustedRoots: [],
	verify: false
};

function getMember(username, password, client,userOrg) {
	var caUrl = ORGS[userOrg].ca.url;

	return client.getUserContext(username, true)
	.then((user) => {
		return new Promise((resolve, reject) => {
			if (user && user.isEnrolled()) {
				return resolve(user);
			}

			var member = new User(username);
			var cryptoSuite = client.getCryptoSuite();
			if (!cryptoSuite) {
				cryptoSuite = Client.newCryptoSuite();
				if (userOrg) {
					cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: module.exports.storePathForOrg(ORGS[userOrg].name)}));
					client.setCryptoSuite(cryptoSuite);
				}
			}
			member.setCryptoSuite(cryptoSuite);

			// need to enroll it with CA server
			var cop = new copService(caUrl, tlsOptions, ORGS[userOrg].ca.name, cryptoSuite);

			return cop.enroll({
				enrollmentID: username,
				enrollmentSecret: password
			}).then((enrollment) => {

				return member.setEnrollment(enrollment.key, enrollment.certificate, ORGS[userOrg].mspid);
			}).then(() => {
				var skipPersistence = false;
				if (!client.getStateStore()) {
					skipPersistence = true;
				}
				return client.setUserContext(member, skipPersistence);
			}).then(() => {
				return resolve(member);
			}).catch((err) => {
			});
		});
	});
}

function getAdmin(client, userOrg) {
	var keyPath = path.join(__dirname, util.format('../artifacts/crypto-config/peerOrganizations/%s.example.com/users/Admin@%s.example.com/msp/keystore', userOrg, userOrg));
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = path.join(__dirname, util.format('../artifacts/crypto-config/peerOrganizations/%s.example.com/users/Admin@%s.example.com/msp/signcerts', userOrg, userOrg));
	var certPEM = readAllFiles(certPath)[0];

	var cryptoSuite = Client.newCryptoSuite();
	if (userOrg) {
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: module.exports.storePathForOrg(ORGS[userOrg].name)}));
		client.setCryptoSuite(cryptoSuite);
	}

	return Promise.resolve(client.createUser({
		username: 'peer'+userOrg+'Admin',
		mspid: ORGS[userOrg].mspid,
		cryptoContent: {
			privateKeyPEM: keyPEM.toString(),
			signedCertPEM: certPEM.toString()
		}
	}));
}

function getOrdererAdmin(client) {
	var keyPath = path.join(__dirname, '../artifacts/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/keystore');
	var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	var certPath = path.join(__dirname, '../artifacts/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp/signcerts');
	var certPEM = readAllFiles(certPath)[0];

	return Promise.resolve(client.createUser({
		username: 'ordererAdmin',
		mspid: 'OrdererMSP',
		cryptoContent: {
			privateKeyPEM: keyPEM.toString(),
			signedCertPEM: certPEM.toString()
		}
	}));
}

function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (!!err)
				reject(new Error('Failed to read file ' + path + ' due to error: ' + err));
			else
				resolve(data);
		});
	});
}

function readAllFiles(dir) {
	var files = fs.readdirSync(dir);
	var certs = [];
	files.forEach((file_name) => {
		let file_path = path.join(dir,file_name);
		logger.debug(' looking at file ::'+file_path);
		let data = fs.readFileSync(file_path);
		certs.push(data);
	});
	return certs;
}

module.exports.getOrderAdminSubmitter = function(client) {
	return getOrdererAdmin(client);
};

module.exports.getSubmitter = function(client, peerOrgAdmin, org) {
	if (arguments.length < 2) throw new Error('"client" and "test" are both required parameters');

	var peerAdmin, userOrg;
	if (typeof peerOrgAdmin === 'boolean') {
		peerAdmin = peerOrgAdmin;
	} else {
		peerAdmin = false;
	}

	// if the 3rd argument was skipped
	if (typeof peerOrgAdmin === 'string') {
		userOrg = peerOrgAdmin;
	} else {
		if (typeof org === 'string') {
			userOrg = org;
		} else {
			userOrg = 'org1';
		}
	}

	if (peerAdmin) {
		return getAdmin(client, userOrg);
	} else {
		return getMember('admin', 'adminpw', client, userOrg);
	}
};
