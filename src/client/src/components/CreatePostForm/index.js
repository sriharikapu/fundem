import React, { Component } from "react";
import styles from './CreatePostForm.module.scss';

export default class CreatePostForm extends Component {
  state = {
      title: "",
      description: "",
      file: ""
  };

  onFieldInput = (field, value) => {
    this.setState({ [field]: value });
  };

  onFileInput = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.setState({ file: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    const { title, description, file } = this.state;
    // TODO: user feedback
    if (!title || !description || !file) return false;
    await this.props.createPost(this.props.user.address, title, description, "");
    // window.location.href = `/user/${ this.props.address }`;
    return false;
  };

  render()  {
    return (
      <form className={styles.form} onSubmit={this.onFormSubmit}>
        <label style={styles.label}>Post Title</label>
        <input style={styles.input} name="title" type="text" value={this.state.title} onChange={(event) => this.onFieldInput("title", event.target.value)} />
        <label style={styles.label}>Post Body</label>
        <textarea style={styles.textarea} name="description" value={this.state.description} onChange={(event) => this.onFieldInput("description", event.target.value)}></textarea>
        <label style={styles.label}>Photo</label>
        <input style={styles.inputFile} type="file" name="file" onChange={(event) => this.onFileInput(event.target.files[0])} />
        <input style={styles.button} type="submit" value="Create Post" />
      </form>
    );
  }
}
