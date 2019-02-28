# Fabric Java SDK for IBM Blockchain platform

Blockchain is a shared, immutable ledger for recording the history of transactions. The Linux Foundation’s Hyperledger Fabric, the software implementation of blockchain IBM is committed to, is a permissioned network. Hyperledger Fabric is a platform for distributed ledger solutions underpinned by a modular architecture delivering high degrees of confidentiality, resiliency, flexibility and scalability.

In a Blockchain solution, the Blockchain network works as a back-end with an application front-end to communicate with the network using a SDK. To set up the communication between front-end and back-end, Hyperledger Fabric community offers a number of SDKs for a wide variety of programming languages. In this tutorial, we will talk about Fabric Java SDK. 

It would be helpful for the Java developers, who started to look into Hyperledger Fabric platform and would like to use Fabric SDK Java for their projects. The SDK helps facilitate Java applications to manage the lifecycle of Hyperledger channels and user chaincode. The SDK also provides a means to execute user chaincode, query blocks and transactions on the channel, and monitor events on the channel. This code pattern will help to get the process started to build a Hyperledger Fabric v1.4 Java application.


## Learning objectives

This tutorial shows how to connect to Hyperledger Fabric network using Java client applications. It shows how client applications can enroll admin user, register and enroll users, Add a transaction block and query for transactions.


## Prerequisites

- Familiarity of Blockchain and Hyperledger Fabric
- Hyperledger Fabric network setup
- Chaincode deployed and instantiated

## Estimated time

Completing this tutorial should take about 30 minutes.

## Steps
1. Get Hyperledger Fabric network details
2. Enroll Admin
3. Register and Enroll Users
4. Invoke Chaincode
5. Query Chaincode


### 1. Get Hyperledger Fabric network details

For the SDK to connect and perform operations on the Hyperledger Fabric network, you need network details like URLs of peer, ca, orderer, channel name, pem certificates for ca, orderer (as it is TLS enabled), chaincode details, etc. IBM Blockchain Platform provides the network configuration details as connection profile (in json). Get network details from connection profile. These details will be used in the code as shown in code snippets below.


### 2. Enroll Admin

When the Hyperledger Fabric network was launched an admin user was registered with Certificate Authority. Now we need to send an enroll call to the CA server and retrieve the enrollment certificate (eCert) for admin. The client application needs this cert in order to form a user object for the admin. We will then use this admin object to subsequently register and enroll a new user.

- Create an instance of org.hyperledger.fabric_ca.sdk.HFCAClient class. This need CA url, CA name and CA pem certificate.

  > Note: Either you can use pem cert file content as a string directly or parse that file location and get the content. 

  ```
  String caUrl = "https://xxx-org1-ca.aus01.blockchain.ibm.com:31011"; // ensure that port is of CA
  String caName = "org1CA";
  String pemStr = "-----BEGIN CERTIFICATE-----\r\n****\r\n-----END CERTIFICATE-----\r\n";

  Properties properties = new Properties();
  properties.put("pemBytes", pemStr.getBytes());

  HFCAClient hfcaClient = HFCAClient.createNewInstance(caName, caUrl, properties);
  ```
  
- Use default crypto suite
  ```
  CryptoSuite cryptoSuite = CryptoSuite.Factory.getCryptoSuite();
  hfcaClient.setCryptoSuite(cryptoSuite);
  ```
Admin user enrollment requires some user details. We have created a class called UserContext for the purpose which holds user details. You can refer to this class code in the code repository provided along with code pattern mentioned above.

- Set UserContext
  ```
  UserContext adminUserContext = new UserContext();
  adminUserContext.setName("admin"); // admin username
  adminUserContext.setAffiliation("org1"); // affiliation
  adminUserContext.setMspId("org1"); // org1 mspid
  ```

- Call enroll API and set the enrollment in UserContext object. It requires admin user name and password.
  ```
  Enrollment adminEnrollment = hfcaClient.enroll("admin", "xxxxxxx"); //pass admin username and password
  adminUserContext.setEnrollment(adminEnrollment);
  ```

- This admin user context, with enrollment set, should be used in subsequent user registration and enrollment. Admin user context should be stored to local files system so that subsequent calls can use the admin user context.
  ```
  Util.writeUserContext(adminUserContext); // save admin context to local file system
  ```

### 3. Register and Enroll Users
To perform various operations on the network, we should not use admin user since the admin has all the privileges. New users need to be registered and enrolled for performing various operations. 

- Register a New User
  ```
  UserContext userContext = new UserContext();
  userContext.setName(name);
  userContext.setAffiliation("org1");
  userContext.setMspId("org1");

  RegistrationRequest rr = new RegistrationRequest("user1", "org1");
  String enrollmentSecret = hfcaClient.register(rr, adminUserContext);
  ```

- Enroll User
  ```
  Enrollment enrollment = hfcaClient.enroll(userContext.getName(), enrollmentSecret);
  userContext.setEnrollment(enrollment);
  Util.writeUserContext(userContext);
  ```

> Note: Once a user is registered, you cannot register again with the same user name.

### 4. Invoke Chaincode
 
To update or query the ledger in a proposal transaction, need to invoke chaincode. To invoke chaincode you need the function name which is defined in chaincode and its arguments. Additionally, the user context is also required to perform invoke operation. This is the same user context that was saved under `Register and Enroll Users` section above. 

- Read the user context that was saved
  ```
  UserContext adminUserContext = Util.readUserContext("org1", "admin");
  CryptoSuite cryptoSuite = CryptoSuite.Factory.getCryptoSuite();
  HFClient hfClient = HFClient.createNewInstance();
  hfClient.setCryptoSuite(cryptoSuite);
  hfClient.setUserContext(adminUserContext);
  ```

- Create peer, eventhub and orderer references. Note that you need to read corresponding pem certificates.
    ```
    String peer_name = "org1-peer1";
    String peer_url = "grpcs://xxxxx-org1-peer1.aus01.blockchain.ibm.com:xxxxx"; // Ensure that port is of peer1
    String pemStr = "-----BEGIN CERTIFICATE-----\r\nxxxxxx\r\n";

    Properties peer_properties = new Properties();
    peer_properties.put("pemBytes", pemStr.getBytes());
    peer_properties.setProperty("sslProvider", "openSSL");
    peer_properties.setProperty("negotiationType", "TLS");

    Peer peer = hfClient.newPeer(peer_name, peer_url, peer_properties);

    String event_url = "grpcs://xxxxxx-org1-peer1.xxxx.blockchain.ibm.com:31003"; // ensure that port is of event hub
    EventHub eventHub = hfClient.newEventHub(peer_name, event_url, peer_properties);

    String orderer_name = "orderer";
    String orderer_url = "grpcs://xxxxx-orderer.xxxx.blockchain.ibm.com:31001"; // ensure that port is of orderer
    String pemStr1 = "-----BEGIN CERTIFICATE-----\r\nxxxxx\r\n-----END CERTIFICATE-----\r\n";

    Properties orderer_properties = new Properties();
    orderer_properties.put("pemBytes", pemStr1.getBytes());
    orderer_properties.setProperty("sslProvider", "openSSL");
    orderer_properties.setProperty("negotiationType", "TLS");
    Orderer orderer = hfClient.newOrderer(orderer_name, orderer_url, orderer_properties);
    ```

- Initialize channel
    ```
    Channel channel = hfClient.newChannel(CHANNEL_NAME);

    channel.addPeer(peer);
    channel.addEventHub(eventHub);
    channel.addOrderer(orderer);
    channel.initialize();
    ```

- Prepare transaction proposal and send to endorsers
    ```
    TransactionProposalRequest request = hfClient.newTransactionProposalRequest();
    String cc = "carauction"; // Chaincode name
    ChaincodeID ccid = ChaincodeID.newBuilder().setName(cc).build();

    request.setChaincodeID(ccid);
    request.setFcn("initLedger"); // Chaincode invoke funtion name
    String[] arguments = { "N4", "Provider", "28-01-2019", "Food", "1000", "04-02-2019" }; // Arguments that Chaincode function takes
    request.setArgs(arguments);
    request.setProposalWaitTime(3000);
    Collection<ProposalResponse> responses = channel.sendTransactionProposal(request);
    for (ProposalResponse res : responses) {
      // Process response from transaction proposal
    }
    ```

- Send transaction to Orderer    
    ```
    CompletableFuture<TransactionEvent> cf = channel.sendTransaction(responses);
    ```

### 5. Query Chaincode

Blockchain transactions that are committed can be queried. 

- Perform the same steps till channel initialization as explained in `Invoke Chaincode` section.

- Prepare transaction proposal and send to peer
  ```
  QueryByChaincodeRequest queryRequest = hfClient.newQueryProposalRequest();
  queryRequest.setChaincodeID(ccid); // ChaincodeId object as created in Invoke block
  queryRequest.setFcn("query"); // Chaincode function name for querying the blocks

  String[] arguments = { "all"}; // Arguments that the above functions takes
  if (arguments != null)
    queryRequest.setArgs(arguments);

  // Query the chaincode  
  Collection<ProposalResponse> queryResponse = channel.queryByChaincode(queryRequest);

  for (ProposalResponse pres : queryResponse) {
    // process the response here
  }
  ```

## Summary

In this tutorial you learnt how to use Java SDK APIs to interact with Hyperledger Fabric Network. You learnt how to enroll admin, register and enroll user, invoke and query chaincode.

## Appendix

### Sample Code

You can find sample code under code/src in this repository.

### Java setup instructions

- Clone this git repo on your machine
- Ensure you have JRE 1.8 or above installed
- Download fabric java sdk 1.4 jar files
- Set classpath pointing to these jar files
- Set classpath pointing to the src folder of this cloned git repo
- change directory to the cloned git repo's src/client folder
- Change/update required parameters in Java classes for your Hyperledger Fabric network
- Run the following commands
```
javac RegisterEnrollUser.java
```
```
javac InvokeChaincode.java
```
```
javac QueryChainCode.java
```

```
java client.RegisterEnrollUser
```
```
java client.InvokeChaincode
```
```
java client.QueryChainCode
```
