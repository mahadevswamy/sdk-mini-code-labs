# FabCar Blockchain Sample

>Hyperledger Fabric sample Fabcar on IBM Blockchain Platform 2.0

Blockchain is a shared, immutable ledger for recording the history of transactions. The Linux Foundation’s Hyperledger Fabric, the software implementation of blockchain IBM is committed to, is a permissioned network. Hyperledger Fabric is a platform for distributed ledger solutions underpinned by a modular architecture delivering high degrees of confidentiality, resiliency, flexibility and scalability.

In a Blockchain solution, the Blockchain network works as a back-end with an application front-end to communicate with the network using a SDK. To set up the communication between front-end and back-end, Hyperledger Fabric community offers a number of SDKs for a wide variety of programming languages. In this tutorial, we will talk about Fabric Node SDK. 

This code pattern we setup our application to interact with the network including identities to submit transactions on the smart contract.  The application is setup with a Node.js server using the Fabric Node SDK to process requests to the network, and a Vue.js client to bring up a web interface.

 
 ## Learning objectives
 When the reader has completed this code pattern, they will understand how to:

* Develop a Node.js server with the Hyperledger Fabric SDK to interact with the deployed network
* Create a Vue.js frontend for the web app to interface with the network

## Estimated time

Completing this tutorial should take about 30 minutes.



# Architecture flow

<p align="center">
  <img src="docs/doc-images/arch-flow.png">
</p>

The developer uses the IBM Blockchain Platform Extension for VS Code to:

1. The Blockchain Operator sets up the IBM Blockchain Platform 2.0 service
2. The IBM Blockchain Platform 2.0 enables to create a Hyperledger Fabric network onto a IBM Kubernetes Service, allowing to install and instantiate the Fabcar smart contract on the network
3. The Node.js application server uses the Fabic sdk to interact with the deployed network on IBM Blockchain Platform 2.0 and creates APIs for a web client
4. The Vue.js client uses the Node.js application API to interact with the network
5. The User interacts with the Fabcar Vue.js web interface to update and query the blockchain ledger and state


# Included components
*	[IBM Blockchain Platform 2.0](https://console.bluemix.net/docs/services/blockchain/howto/ibp-v2-deploy-iks.html#ibp-v2-deploy-iks) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
*	[IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) gcreates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.
* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) is designed to assist users in developing, testing, and deploying smart contracts -- including connecting to Hyperledger Fabric environments.

## Featured technologies
+ [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
+ [Node.js](https://nodejs.org) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
+ [Express.js](https://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications
+ [Vue.js](https://getbootstrap.com/) is an open source toolkit for developing with HTML, CSS, and JavaScript.

## Running the application

Follow these steps to set up and run this code pattern. The steps are described in detail below.

### Prerequisites

- [IBM Cloud account](https://cloud.ibm.com/registration/?target=%2Fdashboard%2Fapps)
- [Node v8.x or greater and npm v5.x or greater](https://nodejs.org/en/download/)
- python2.7(https://www.python.org/downloads/release/python-2716/)
- openSSL configuration (opensslcreation link https://knowledge.digicert.com/solution/SO27347.html)

### Steps



1. [Clone the repo](#1-clone-the-repo)
3. [Run the application](#2-run-the-application)


## 1. Clone the repo

Clone this repository in a folder your choice:

```bash
git clone https://github.com/pradeepthiduggaraju/Fabcar-sb.git
cd fabcar-blockchain-sample
```



## 2. Run the application

* #### Enroll admin

When the Hyperledger Fabric network was launched an admin user was registered with Certificate Authority. Now we need to send an enroll call to the CA server and retrieve the enrollment certificate (eCert) for admin. The client application needs this cert in order to form a user object for the admin. We will then use this admin object to subsequently register and enroll a new user.

  - First, navigate to the `web-app` directory, and install the node dependencies.
    ```bash
    cd web-app/server
    npm install
    ```
When your network was created in the Starter Plan, each organization had an Administrator user called admin automatically registered with the Certificate Authority (CA). You now need to send an enrolment request to the CA to retrieve that user’s enrollment certificate (eCert).

  - Run the `enrollAdmin.js` script
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:
    ```bash
    msg: Successfully enrolled admin user app-admin and imported it into the wallet
    ```

* #### Register User
To perform various operations on the network, we should not use admin user since the admin has all the privileges. New users need to be registered and enrolled for performing various operations. 

  - Run the `registerUser.js` script.
    ```bash
    node registerUser.js
    ```

  - You should see the following in the terminal:
    ```bash
    Successfully registered and enrolled admin user user1 and imported it into the wallet
    ```



* #### Start the application server

  - From the `server` directory, start the server.

    ```bash
    npm start
    ```

* #### Start the web client
  - In a new terminal, open the web client folder and install the dependencies.
    ```bash
    cd web-app/client
    npm install
    ```

  - Start the client:
    ```bash
    npm run serve
    ```

You can find the app running at http://localhost:8082/

<br>
<p align="center">
  <img src="docs/doc-gifs/application.gif">
</p>
<br>

You can go to the IBM Blockchain Platform v2 console to monitor your users and get information on your channel including the blocks added.

<br>
<p align="center">
  <img src="docs/doc-gifs/channel-blocks.gif">
</p>
<br>

