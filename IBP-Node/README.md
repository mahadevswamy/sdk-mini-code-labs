# Fabric Node SDK for IBM Blockchain platform

Blockchain is a shared, immutable ledger for recording the history of transactions. The Linux Foundation’s Hyperledger Fabric, the software implementation of blockchain IBM is committed to, is a permissioned network. Hyperledger Fabric is a platform for distributed ledger solutions underpinned by a modular architecture delivering high degrees of confidentiality, resiliency, flexibility and scalability.

In a Blockchain solution, the Blockchain network works as a back-end with an application front-end to communicate with the network using a SDK. To set up the communication between front-end and back-end, Hyperledger Fabric community offers a number of SDKs for a wide variety of programming languages. In this tutorial, we will talk about Fabric Node SDK. 



## Learning objectives

This tutorial shows how to connect to Hyperledger Fabric network using Node JS client applications. It shows how we can-
1. Run a sample application to invoke the chaincode.
2. Enroll admin user, register and enroll users
3. Add a transaction block and query for transactions.


## Prerequisites

- Chaincode deployed and instantiated- [Fabcar-Network](https://github.com/hyperledger/fabric-sdk-rest/blob/master/tests/input/src/fabcar/fabcar.go)
- NPM version >= 5.6.0
- Node version >= 8.10.0
- If you do not have an IBM Cloud account yet, you will need to create one [here](https://cloud.ibm.com/resources).
- In your IBM Cloud account, create a Blockchain Starter Plan service on your IBM Cloud account, as shown below:


  ![nyDSaF](https://i.makeagif.com/media/4-11-2018/nyDSaF.gif)


## Estimated time

Completing this tutorial should take about 30 minutes.

## Steps
1. Get Hyperledger Fabric network details
2. Enroll Admin
3. Register and Enroll Users
4. Invoke Chaincode
5. Query Chaincode


### 1. Get Hyperledger Fabric network details

For the SDK to connect and perform operations on the Hyperledger Fabric network, you need network details like URLs of peer, ca, orderer, channel name, pem certificates for ca, orderer (as it is TLS enabled), chaincode details, etc. IBM Blockchain Platform provides the network configuration details as connection profile (in json). 

* Get network details from `Overview>Connection Profile>Download`. 
* Clone this repo and Navigate to `sdk-mini-code-labs/IBP-Node/creds.json`. If you wish to use a new Connection Profile, download it and rename it as `creds.json` in the same folder.

### 2. Enroll Admin

When the Hyperledger Fabric network was launched an admin user was registered with Certificate Authority. Now we need to send an enroll call to the CA server and retrieve the enrollment certificate (eCert) for admin. The client application needs this cert in order to form a user object for the admin. We will then use this admin object to subsequently register and enroll a new user.

1. Open the command line or terminal window and run the npm install command from within the `sdk-mini-code-labs/IBP-Node` folder.

``` 
  npm install
```

When your network was created in the Starter Plan, each organization had an Administrator user called admin automatically registered with the Certificate Authority (CA). You now need to send an enrolment request to the CA to retrieve that user’s enrollment certificate (eCert).

2. From the CWD run the `enrollAdmin.js` file.

``` 
  node enrollAdmin.js
```

For a different, Connection Profile-

 ![packageFile](https://github.com/IBM/car-auction-network-fabric-node-sdk/blob/master/docs/enrollAdmin.gif)
 
 And in the code uncomment the line (fabric_ca_client = new Fabric_CA_Client('https://<enrollID>:<enrollSecret>@<ca_url_with_port>', null ,'<caName>', crypto_suite);) to replace with your Connection Profile-

We will need 4 things from the Certificate Authority

* enrollId - should be "admin"
* enrollSecret - should be similar to "1dcab332aa"
* url - should be similar to "nde288ef7dd7542d3a1cc824a02be67f1-org1-ca.us02.blockchain.ibm.com:31011"
* caName - should be "org1CA"

```
return fabric_ca_client.enroll({
          enrollmentID: 'admin',
          enrollmentSecret: '4252f3499a'
        }).then((enrollment) =>
```

* Replace `enrollmentSecret` with yours.

The enrollAdmin.js application creates a local public/private key pair in a folder it creates called hfc-key-store and sends a Certificate Signing Request (CSR) to the remote CA for org1 to issue the eCert. The eCert, along with some metadata, will also be stored in the `hfc-key-store` folder. The connection details of where the CA is located and the TLS certificate needed to connect to it are all obtained by the application from the network-profile.json you downloaded earlier.

### 3. Register and Enroll Users
To perform various operations on the network, we should not use admin user since the admin has all the privileges. New users need to be registered and enrolled for performing various operations. 

* From the CWD run:

```
  node registerUser.js
```

For a different, Connection Profile-

Copy the same URL change made from `enrollAdmin.js`


Like the previous command, this application has created a new public/private key pair and sent a CSR request to the CA to issue the eCert for user1. If you look in the `hfc-key-store` folder, you should see 6 files, 3 for each identity.
> Note: Once a user is registered, you cannot register again with the same user name.

### 4. Invoke Chaincode
 
To update or query the ledger in a proposal transaction, need to invoke chaincode. To invoke chaincode you need the function name which is defined in chaincode and its arguments. Additionally, the user context is also required to perform invoke operation. This is the same user context that was saved under `Register and Enroll Users` section above. 

* From the CWD run:

```
  node invoke.js
```

Because the chaincode runs in a separate chaincode docker container, it can take some time to start this container on first use. If you get a timeout or a “premature execution” error, just try running the command again. If you take a look at the Channel Overview after the command has completed successfully, you should see there is now an extra block on the ledger.

### 5. Query Chaincode

The invokeNetwork.js command has now populated the ledger with sample data for 10 cars, so let’s query the ledger to see the data. To do this, you’ll run the query.js command, which is set up to query all cars that exist on the ledger.

* From the CWD run:

```
node query.js
```
## Summary

In this tutorial you learnt how to use Node JS SDK APIs to interact with Hyperledger Fabric Network. You learnt how to enroll admin, register and enroll user, invoke and query chaincode.
