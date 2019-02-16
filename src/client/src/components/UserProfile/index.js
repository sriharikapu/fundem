import React, { Component } from "react";
import CreatePostForm from '../CreatePostForm/index.js';
import styles from './UserProfile.module.scss';

export default class UserProfile extends Component {
  state = {
    isReady: false,
    isSubscriptionValid: false,
    postModalVisible: false,
    subModalVisible: false
  };

  async componentDidMount () {
    await this.checkSubscription();
  }

  checkSubscription = async () => {
    const { user } = this.props;
    const { address } = user;
    const isSubscriptionValid = await this.props.getSubscriptionStatus(address);
    // this.setState({ isSubscriptionValid });
    this.setState({ isSubscriptionValid: true }, async () => {
      if (this.state.isSubscriptionValid) {
        await this.props.getPosts(address);
        this.setState({ isReady: true });
      } else {
        this.setState({ isReady: true });
      }
    });
  };
  
  onClickCreatePost = (event) => {
    event.preventDefault();
    this.setState({ postModalVisible: true });
    return false;
  };

  onClickSubscribe = async (event) => {
    event.preventDefault();
    const { user, web3 } = this.props;
    const { address } = user;
    const amount = web3.utils.toWei("0.25", "ether");
    await this.props.createSubscription(address, amount);
    await this.checkSubscription();
    return false;
  };

  render()  {
    const { user, posts } = this.props;
    const { address, title, description } = user;
    const { isReady, isSubscriptionValid, postModalVisible, subModalVisible } = this.state;

    return (
      <div className={styles.profile}>
        {postModalVisible && <CreatePostForm user={user} createPost={this.props.createPost} />}
        {subModalVisible && <div></div>}
        {isReady && <div>
          {!isSubscriptionValid && <a href="/subscribe" onClick={this.onClickSubscribe}>Subscribe</a>}
          <a href="/createPost" onClick={this.onClickCreatePost}>Create Post</a>
          <h1>{ title }</h1>
          <h2>{ address }</h2>
          <h3>{ description }</h3>
          {posts && posts.map((post, index) => (
            <div className={styles.post} key={`post-${ index }`}>
              <h1>{ post[0] }</h1>
              <p>{ post[1] }</p>
              <p>{ post[2] }</p>
            </div>
          ))}
        </div>}
      </div>
    );
  }
}
