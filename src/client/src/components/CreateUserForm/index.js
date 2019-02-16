import React, { Component } from "react";
import styles from './CreateUserForm.module.scss';

export default class CreateUserForm extends Component {
  state = {
      title: "",
      description: ""
  };

  onFieldInput = (field, value) => {
      this.setState({ [field]: value });
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    const { title, description } = this.state;
    // TODO: user feedback
    if (!title || !description) return false;
    await this.props.createUser(title, description);
    window.location.href = "/";
    return false;
  };

  render()  {
    return (
      <form className={styles.form} onSubmit={this.onFormSubmit}>
        <label style={styles.label}>Account Name</label>
        <input style={styles.input} name="title" type="text" value={this.state.title} onChange={(event) => this.onFieldInput("title", event.target.value)} />
        <label style={styles.label}>Brief Overview</label>
        <textarea style={styles.textarea} name="description" value={this.state.description} onChange={(event) => this.onFieldInput("description", event.target.value)}></textarea>
        <input style={styles.button} type="submit" value="Create Account" />
      </form>
    );
  }
}
