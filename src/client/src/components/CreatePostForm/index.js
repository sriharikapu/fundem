import React, { Component } from "react";
import modalStyles from '../../layout/modal.module.scss';
import formStyles from '../../layout/form.module.scss';
import buttonStyles from '../../layout/button.module.scss';

export default class CreatePostForm extends Component {
  firstInput = undefined;
  state = {
      title: "",
      description: "",
      file: "",
      fileName: ""
  };

  onFieldInput = (field, value) => {
    this.setState({ [field]: value });
  };

  focusInput = () => {
    this.firstInput.focus();
  };

  onFileInput = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.setState({
        file: event.target.result,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    const { title, description, file } = this.state;
    // TODO: user feedback
    if (!title || !description || !file) return false;
    await this.props.createPost(this.props.user.address, title, description, "");
    this.props.onCloseModal();
    this.props.getPosts(this.props.user.address);
    return false;
  };

  render()  {
    return (
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalContent}>
          <button className={modalStyles.modalClose} onClick={this.props.onCloseModal}>X</button>
          <h1>New Post</h1>
          <form className={formStyles.form} onSubmit={this.onFormSubmit}>
            <label>Post Title</label>
            <input
              name="title"
              type="text"
              value={this.state.title}
              ref={(input) => this.firstInput = input}
              onChange={(event) => this.onFieldInput("title", event.target.value)} />
            <label>Post Body</label>
            <textarea rows="3" name="description" value={this.state.description} onChange={(event) => this.onFieldInput("description", event.target.value)}></textarea>
            <label>Photo</label>
            <div className={formStyles.file}>
              <input type="file" name="file" onChange={(event) => this.onFileInput(event.target.files[0])} />
              <button tabIndex="-1">{this.state.fileName || "Select a photo"}</button>  
            </div>
            <input className={buttonStyles.button} type="submit" value="Create Post" />
          </form>
        </div>
      </div>
    );
  }
}
