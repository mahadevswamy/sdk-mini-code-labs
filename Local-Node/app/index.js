"use strict"

module.exports = {

  chaincodeInstaller: require('./install-chaincode').chaincodeInstaller,
  chaincodeInstantiator: require('./instantiate-chaincode').chaincodeInstantiator
}