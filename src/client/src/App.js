import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Instructions from "./components/Instructions/index.js";
import CreateUserForm from "./components/CreateUserForm/index.js";
import UserList from "./components/UserList/index.js";
import UserProfile from "./components/UserProfile/index.js";
import styles from './App.module.scss';

class App extends Component {
  state = {
    storageValue: 0,
    node: null,
    web3: null,
    accounts: null,
    contract: null,
    route: "",
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
    try {
      Fundem = require("./contracts/Fundem.json");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const web3 = await getWeb3();
      let ganacheAccounts = [];
      if (!isProd) {
        // Get network provider and web3 instance.
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
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
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    try {
      const node = await new window.Ipfs();
      this.setState({ ipfs: { isReady: true, node }});
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

  getUserInstance = (address) => {
    try {
      const User = require("./contracts/User.json");
      return new this.state.web3.eth.Contract(User.abi, address, { from: this.state.accounts[0] });
    } catch (err) {
      throw new Error(err);
    }
  };

  refreshValues = async (instance) => {
    if (instance) {
      await this.getUsers();
    }
  }

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
    const { accounts } = this.state;
    let userInstance = null;
    let info = {};

    try {
      userInstance = this.getUserInstance(address);
      info = await userInstance.methods.getInfo().call({ from: accounts[0] });
      return { address, title: info[0], description: info[1] };
    } catch (e) {
      console.log(e);
    }
  };

  createUser = async (title, description) => {
    const { accounts, contract } = this.state;
    try {
      await contract.methods.createUser(title, description).send({ from: accounts[0], gas: 2000000 });
      this.refreshValues();
      this.setRoute("");
    } catch (e) {
      console.log(e);
    }
  };

  createPost = async (address, title, description, file, fileName) => {
    const { accounts, ipfs } = this.state;
    let userInstance = null;
    let ipfsEntry = null;
    let hash = null;

    try {
      ipfsEntry = await ipfs.node.add(file);
      hash = ipfsEntry[0].hash;
      userInstance = this.getUserInstance(address);
      await userInstance.methods.createPost(title, description, hash).send({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
  };

  getPosts = async (address) => {
    const { accounts } = this.state;
    let userInstance = null;
    let post = null;
    let posts = [];
    let postCount = null;

    try {
      userInstance = this.getUserInstance(address);
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
    const { accounts } = this.state;
    let userInstance = null;
    let isOwner = false;

    try {
      userInstance = this.getUserInstance(address);
      isOwner = await userInstance.methods.isOwner().call({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
    
    return isOwner;
  };

  getSubscriptionStatus = async (address) => {
    const { contract, accounts } = this.state;
    let userContractAddress = null;
    let userInstance = null;
    let subscriptionExpiration = null;
    let isSubscriptionValid = false;

    try {
      userContractAddress = await contract.methods.getUserContractAddress().call({ from: accounts[0] });
      userInstance = this.getUserInstance(userContractAddress);
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
    let userContractAddress = null;
    let userInstance = null;

    try {
      userContractAddress = await contract.methods.getUserContractAddress().call({ from: accounts[0] });
      userInstance = this.getUserInstance(userContractAddress);
      await userInstance.methods.createSubscription(address).send({
        from: accounts[0],
        value: web3.utils.toWei("0.1", "ether")
      });
    } catch (e) {
      console.log(e);
    }
  };

  setRoute = (route, event) => {
    if (event) event.preventDefault();
    let historyRoute = route;
    if (process.env.NODE_ENV === 'production') historyRoute = "/fundem/" + historyRoute;
    window.history.pushState({}, "", historyRoute || "/");
    this.setState({ route });
    return false;
  };

  handleBrowserNavigation = (event) => {
    this.setState({ route: window.location.pathname });
  };

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
        <Header setRoute={this.setRoute} web3Ready={!!this.state.web3} />
          <div class={styles.main}>
            {this.state.route === "" && this.renderUsers()}
            {this.state.route === `createUser` && this.renderCreateUser()}
            {this.state.route.indexOf('user/') > -1 && this.renderUser()}
          </div>
      </div>
    );
  }
}

export default App;
