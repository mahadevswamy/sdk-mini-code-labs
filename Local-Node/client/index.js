//export all chaincode modules
"use strict"

module.exports = {
  chaincodeInstaller: require(__dirname+'/install-chaincode').chaincodeInstaller,
  chaincodeInstantiator: require(__dirname+'/instantiate-chaincode').chaincodeInstantiator,
  chaincodeInvoker: require(__dirname+'/invoke-transaction').chaincodeInvoker,
  chaincodeQuery: require(__dirname+'/query').chaincodeQuery
}
