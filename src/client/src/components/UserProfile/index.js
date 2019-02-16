import React, { Component } from "react";
import CreatePostForm from '../CreatePostForm/index.js';
import styles from './UserProfile.module.scss';

export default class UserProfile extends Component {
  createPostModal = undefined;
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

  render()  {
    const { user, posts } = this.props;
    const { title, description } = user;
    const { isReady, isSubscriptionValid, postModalVisible, subModalVisible } = this.state;

    return (
      <div className={styles.profile}>
        {postModalVisible && <CreatePostForm
          user={user}
          createPost={this.props.createPost}
          onCloseModal={this.onClickCreatePost}
          ref={(modal) => this.createPostModal = modal} />}
        {subModalVisible && <div></div>}
        {isReady && <div>
          {!isSubscriptionValid && <a href="/subscribe" onClick={this.onClickSubscribe}>Subscribe</a>}
          <div className={styles.profileContent}>
            <div className={styles.overview}>
              <h1>{ title }</h1>
              <p>{ description }</p>
              <a href="/createPost" onClick={this.onClickCreatePost}>Create Post</a>
            </div>
            <ol className={styles.posts}>
              {posts && posts.map((post, index) => (
                <li className={styles.post} key={`post-${ index }`}>
                  <img src={post[2]} alt="" />
                  <div>
                    <p className={styles.postDate}>February 16, 2019</p>
                    <h1>{ post[0] }</h1>
                    <p className={styles.postBody}>{ post[1] }</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>}
      </div>
    );
  }
}
