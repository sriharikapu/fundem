import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Instructions from "./components/Instructions/index.js";
import CreateUserForm from "./components/CreateUserForm/index.js";
import UserList from "./components/UserList/index.js";
import UserProfile from "./components/UserProfile/index.js";
import { Loader } from 'rimble-ui';

import styles from './App.module.scss';

class App extends Component {
  footer = null;
  state = {
    currentTx: {
      isSuccess: false,
      isWorking: false,
      description: ""
    },
    storageValue: 0,
    node: null,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname,
    users: {},
    posts: []
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  componentDidMount = async () => {
    let Fundem = {};
    this.setCurrentTx("Establishing network connection");
    try {
      Fundem = require("./contracts/Fundem.json");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        let instance = null;
        let deployedNetwork = null;

        if (Fundem.networks) {
          deployedNetwork = Fundem.networks[networkId.toString()];
          if (deployedNetwork) {
            instance = new web3.eth.Contract(
              Fundem.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (instance) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId,
            isMetaMask, contract: instance }, () => {
              this.refreshValues(instance);
              setInterval(() => {
                this.refreshValues(instance);
              }, 5000);
            });
        }
        else {
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, isMetaMask });
        }
        this.setCurrentTxSuccess("Network connection established");
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      this.setCurrentTxFailure("Could not establish network connection");
      console.error(error);
    }
    try {
      const node = await new window.Ipfs();
      this.setState({ ipfs: { isReady: true, node }});
      console.log(this.state.ipfs.Buffer);
    } catch (e) {
      console.log(e);
      this.setState({ ipfs: { isReady: false, node: null }});
    }
    window.onpopstate = this.handleBrowserNavigation;
  };

  componentWillUnmount () {
    this.state.ipfs.node.stop();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = async (instance) => {
    if (instance) {
      await this.getUsers();
    }
  }

  setCurrentTx = (description) => {
    this.setState({ currentTx: { description, isComplete: false, isWorking: true, isSuccess: false } });
    this.footer.showTxProcessing();
  };

  setCurrentTxSuccess = (description) => {
    this.setState({ currentTx: { description, isComplete: true, isWorking: false, isSuccess: true } });
    this.footer.showTxResult();
  };

  setCurrentTxFailure = (description) => {
    this.setState({ currentTx: { description, isComplete: true, isWorking: false, isSuccess: false } });
    this.footer.showTxResult();
  };

  getUsers = async () => {
    const { accounts, contract } = this.state;
    const users = {};
    let user = null;
    let userCount = null;
    let userAddress = null;

    try {
      userCount = await contract.methods.getUserCount().call({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
    if (userCount) {
      for (let i = 0; i < userCount; i++) {
        userAddress = await contract.methods.getUserAddress(i).call({ from: accounts[0] });
        user = await this.getUser(userAddress);
        users[userAddress] = user;
      }
      this.setState({ users: users });
    }
  };

  getUser = async (address) => {
    const { accounts, web3 } = this.state;
    let User = {};
    let userInstance = null;
    let info = {};

    try {
      User = require("./contracts/User.json");
      userInstance = new web3.eth.Contract(User.abi, address, { from: accounts[0] });
      info = await userInstance.methods.getInfo().call({ from: accounts[0] });
      return { address, title: info[0], description: info[1] };
    } catch (e) {
      console.log(e);
    }
  };

  createUser = async (title, description) => {
    const { accounts, contract } = this.state;
    this.setCurrentTx("Creating user account");
    try {
      await contract.methods.createUser(title, description).send({ from: accounts[0] });
      this.setCurrentTxSuccess("User account created successfully");
      this.refreshValues();
      this.setRoute(`/`);
    } catch (e) {
      console.log(e);
      this.setCurrentTxFailure("Error creating user account");
    }
  };

  createPost = async (address, title, description, file, fileName) => {
    const { accounts, ipfs, web3 } = this.state;
    let User = {};
    let userInstance = null;
    let ipfsEntry = null;
    let hash = null;
    this.setCurrentTx("Publishing post");

    try {
      ipfsEntry = await ipfs.node.add(file);
      hash = ipfsEntry[0].hash;
      User = require("./contracts/User.json");
      userInstance = new web3.eth.Contract(User.abi, address);
      await userInstance.methods.createPost(title, description, hash).send({ from: accounts[0] });
      this.setCurrentTxSuccess("Post published successfully");
    } catch (e) {
      console.log(e);
      this.setCurrentTxFailure("Error publishing post");
    }
  };

  getPosts = async (address) => {
    const { accounts, web3 } = this.state;
    let User = {};
    let userInstance = null;
    let post = null;
    let posts = [];
    let postCount = null;

    try {
      User = require("./contracts/User.json");
      userInstance = new web3.eth.Contract(User.abi, address);
      postCount = await userInstance.methods.getPostCount().call({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
    if (postCount) {
      for (let i = 0; i < postCount; i++) {
        post = await userInstance.methods.getPost(i).call({ from: accounts[0] });
        posts.push(post);
      }
      this.setState({ posts: posts });
    }
  };

  getOwnerStatus = async (address) => {
    const { accounts, web3 } = this.state;
    let User = {};
    let contractInstance = null;
    let isOwner = false;

    try {
      User = require("./contracts/User.json");
      contractInstance = new web3.eth.Contract(User.abi, address);
      isOwner = await contractInstance.methods.isOwner().call({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
    
    return isOwner;
  };

  getSubscriptionStatus = async (address) => {
    const { contract, accounts, web3 } = this.state;
    let User = {};
    let userContractAddress = null;
    let userInstance = null;
    let subscriptionExpiration = null;
    let isSubscriptionValid = false;

    try {
      User = require("./contracts/User.json");
      userContractAddress = await contract.methods.getUserContractAddress().call({ from: accounts[0] });
      userInstance = new web3.eth.Contract(User.abi, userContractAddress);
      subscriptionExpiration = await userInstance.methods.getSubscriptionExpiration(address).call({ from: accounts[0] });
      if (subscriptionExpiration) {
        isSubscriptionValid = new Date().getTime() / 1000 < subscriptionExpiration;
      }
    } catch (e) {
      console.log(e);
    }

    return isSubscriptionValid;
  };

  createSubscription = async (address) => {
    const { contract, accounts, web3 } = this.state;
    let User = {};
    let userContractAddress = null;
    let userInstance = null;
    this.setCurrentTx("Subscribing...");

    try {
      User = require("./contracts/User.json");
      userContractAddress = await contract.methods.getUserContractAddress().call({ from: accounts[0] });
      userInstance = new web3.eth.Contract(User.abi, userContractAddress);
      await userInstance.methods.createSubscription(address).send({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether")
      });
      this.setCurrentTxSuccess("Subscription confirmed succesfully");
    } catch (e) {
      console.log(e);
      this.setCurrentTxFailure("Error confirming subscription");
    }
  };

  setRoute = (route, event) => {
    if (event) event.preventDefault();
    window.history.pushState({}, "", `http://localhost:3000${route}`);
    this.setState({ route });
    return false;
  };

  handleBrowserNavigation = (event) => {
    this.setState({ route: window.location.pathname });
  };

  renderLoader () {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck (instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey} accounts={this.state.accounts} />
      </div>
    );
  }

  renderUsers () {
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.contract && (this.renderDeployCheck("fundem"))}
        {this.state.web3 && this.state.contract && (
          <UserList
            setRoute={this.setRoute}
            users={this.state.users} />
        )}
      </div>
    );
  }

  renderCreateUser () {
    return (
      <div className={styles.wrapper}>
        <CreateUserForm
          createUser={this.createUser} />
      </div>
    );
  }

  renderUser () {
    const { users, posts } = this.state;
    const userAddress = window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
    return (
      <div className={styles.wrapper}>
        <UserProfile
          createPost={this.createPost}
          createSubscription={this.createSubscription}
          getPosts={this.getPosts}
          getSubscriptionStatus={this.getSubscriptionStatus}
          getOwnerStatus={this.getOwnerStatus}
          setRoute={this.setRoute}
          user={users[userAddress]}
          posts={posts}
          ipfs={this.state.ipfs}
          web3={this.state.web3} />
      </div>
    )
  }

  render () {
    return (
      <div className={styles.App}>
        <Header setRoute={this.setRoute} />
          {this.state.route === '/' && this.renderUsers()}
          {this.state.route === '/createUser' && this.renderCreateUser()}
          {this.state.route.indexOf('/user/') > -1 && this.renderUser()}
        <Footer
          currentTx={this.state.currentTx}
          ref={(footer) => this.footer = footer} />
      </div>
    );
  }
}

export default App;
