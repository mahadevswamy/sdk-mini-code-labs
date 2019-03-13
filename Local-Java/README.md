# Fabric Java SDK for Local Hyperledger-Fabric

Blockchain is a shared, immutable ledger for recording the history of transactions. The Linux Foundation’s Hyperledger Fabric, the software implementation of blockchain IBM is committed to, is a permissioned network. Hyperledger Fabric is a platform for distributed ledger solutions underpinned by a modular architecture delivering high degrees of confidentiality, resiliency, flexibility and scalability.

In a Blockchain solution, the Blockchain network works as a back-end with an application front-end to communicate with the network using a SDK. To set up the communication between front-end and back-end, Hyperledger Fabric community offers a number of SDKs for a wide variety of programming languages. In this tutorial, we will talk about Fabric Java SDK.

It would be helpful for the Java developers, who started to look into Hyperledger Fabric platform and would like to use Fabric SDK Java for their projects. The SDK helps facilitate Java applications to manage the lifecycle of Hyperledger channels and user chaincode. The SDK also provides a means to execute user chaincode, query blocks and transactions on the channel, and monitor events on the channel. This code pattern will help to get the process started to build a Hyperledger Fabric v1.4 Java application.


## Learning objectives

This tutorial shows how to connect to Hyperledger Fabric network using Java client applications. It shows how to setup a basic blockchain network, create channel, deploy a sample chaincode on to the blockchain channel, invoke transactions on the blockchain network.


## Prerequisites

- Familiarity of Blockchain and Hyperledger Fabric
- Install Docker version 17.03.1 or higher
- Install go version go1.9 or above

## Estimated time

Completing this tutorial should take about 30 minutes.

## Steps
1. Setup the repository
2. Setup Hyperledger Fabric network
3. Create Channel
4. Deploy Chaincode
5. Invoke Chaincode
6. Query Chaincode


### 1. Setup the repository
  - Clone this git repo on your machine
  - Ensure you have JRE 1.8 or above installed
  - Import the project into eclipse

### 2. Setup Hyperledger Fabric network

  Pull all the fabric images like ca, orderer, peer and bring up the docker containers.

  ```
  cd Local-Java/network/
  run ./build.sh
  ```

  This will create the basic blockchain network with two ca, one orderer and four peers.

  Note : The fabric image versions considered here is 1.1.0.

### 3. Create Channel

  A Hyperledger Fabric channel is a private “subnet” of communication between two or more specific network members, for the purpose of conducting private and confidential transactions. A channel is defined by members (organizations), anchor peers per member, the shared ledger, chaincode application(s) and the ordering service node(s). Each transaction on the network is executed on a channel, where each party must be authenticated and authorized to transact on that channel.

  ```
  Execute org.app.network.CreateChannel.java
  ```

  This will create the default channel - mychannel. To update the default values, eidt here : org.app.config.Config.java


### 4. Deploy chaincode
  Chaincode is a program, written in Go, node.js, or Java that implements a prescribed interface. Chaincode runs in a secured Docker container isolated from the endorsing peer process. Chaincode initializes and manages ledger state through transactions submitted by applications.

  ```
  Execute org.app.network.DeployInstantiateChaincode.java
  ```

  You can update the chaincode here : chaincode/src/github.com


### 4. Invoke Chaincode

  To update or query the ledger in a proposal transaction, need to invoke chaincode. To invoke chaincode you need the function name which is defined in chaincode and its arguments. Additionally, the user context is also required to perform invoke operation.


  ```
  Execute org.app.chaincode.invocation.InvokeChaincode.java
  ```

  Note : The input to chaincode is hardcoded here. If you have updated the chaincode, please update  InvokeChaincode.java


### 5. Query Chaincode

  Query transactions will be invoked on the blockchain ledger.

  ```
  Execute org.app.chaincode.invocation.InvokeChaincode.java
  ```

## Summary

In this tutorial you learnt how to setup a hyperledger fabric network and use Java SDK APIs to interact it.
