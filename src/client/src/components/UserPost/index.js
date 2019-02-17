import React, { Component } from "react";
import styles from '../UserProfile/UserProfile.module.scss';

export default class UserPost extends Component {
  state = {
    imageUrl: ""
  };

  async componentDidMount () {
    const hash = this.props.post[2];
    const urlCreator = window.URL || window.webkitURL;
    const files = await this.props.ipfs.node.get(hash);
    const image = new Blob([files[0].content]);
    setTimeout(() => {
      this.setState({ imageUrl: urlCreator.createObjectURL(image) });
    }, 1000);
  }

  render ()  {
    const { post } = this.props;
    const { imageUrl } = this.state;
    const postTitle = post[0];
    const postDescription = post[1];
    
    return <li className={styles.post}>
      <img src={ imageUrl } alt="" />
      <div>
        <p className={styles.postDate}>February 16, 2019</p>
        <h1>{ postTitle }</h1>
        <p className={styles.postBody}>{ postDescription }</p>
      </div>
    </li>;
  }
}
