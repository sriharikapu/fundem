import React, { Component } from "react";
import CreatePostForm from '../CreatePostForm/index.js';
import UserPost from '../UserPost/index.js';
import styles from './UserProfile.module.scss';

export default class UserProfile extends Component {
  createPostModal = undefined;
  state = {
    isReady: false,
    isSubscriptionValid: false,
    isOwner: false,
    postModalVisible: false,
    subModalVisible: false
  };

  async componentDidMount () {
    await this.checkOwnership();
    await this.props.getOwnerStatus(this.props.user.address);
    await this.checkSubscription();
  }

  checkOwnership = async () => {
    const { user } = this.props;
    const { address } = user;
    const isOwner = await this.props.getOwnerStatus(address);
    this.setState({ isOwner });
  };

  checkSubscription = async () => {
    const { user } = this.props;
    const { address } = user;
    const isSubscriptionValid = await this.props.getSubscriptionStatus(address);
    this.setState({ isSubscriptionValid, isReady: false }, async () => {
      if (this.state.isOwner || this.state.isSubscriptionValid) {
        await this.props.getPosts(address);
        this.setState({ isReady: true });
      } else {
        this.setState({ isReady: true });
      }
    });
  };
  
  onClickCreatePost = (event) => {
    if (event) event.preventDefault();
    this.setState({ postModalVisible: !this.state.postModalVisible }, () => {
      if (this.state.postModalVisible) {
        this.createPostModal.focusInput();
      }
    });
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

  render ()  {
    const { user, posts } = this.props;
    const { title, description } = user;
    const { isReady, isSubscriptionValid, isOwner, postModalVisible, subModalVisible } = this.state;
    const urlCreator = window.URL || window.webkitURL;

    return (
      <div className={styles.profile}>
        {postModalVisible && <CreatePostForm
          user={user}
          createPost={this.props.createPost}
          checkSubscription={this.checkSubscription}
          onCloseModal={this.onClickCreatePost}
          ref={(modal) => this.createPostModal = modal} />}
        {subModalVisible && <div></div>}
        {isReady && <div>
          <div className={styles.profileContent}>
            <div className={styles.overview}>
              <h1>{ title }</h1>
              <p>{ description }</p>
              {isOwner && <a href="/createPost" onClick={this.onClickCreatePost}>Create Post</a>}
              {!isOwner && !isSubscriptionValid && <a href="/subscribe" onClick={this.onClickSubscribe}>Subscribe</a>}
              {!isOwner && isSubscriptionValid && <span>Subscribed!</span>}
            </div>
            <ol className={styles.posts}>
              {(isOwner || isSubscriptionValid) && posts && posts.slice(0).reverse().map((post, index) => (
                <UserPost post={post} ipfs={this.props.ipfs} key={`post-${ index }`} />
              ))}
            </ol>
          </div>
        </div>}
      </div>
    );
  }
}
