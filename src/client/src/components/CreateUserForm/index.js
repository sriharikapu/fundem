import React, { Component } from "react";
import styles from './CreateUserForm.module.scss';
import formStyles from '../../layout/form.module.scss';
import buttonStyles from '../../layout/button.module.scss';

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
      <div className={styles.createUser}>
        <h1>Create Account</h1>
        <p>Sign up to start supporting your favorite artists and creators.</p>
        <form className={formStyles.form} onSubmit={this.onFormSubmit}>
          <label>Account Name</label>
          <input name="title" type="text" value={this.state.title} onChange={(event) => this.onFieldInput("title", event.target.value)} />
          <label>Brief Overview</label>
          <textarea rows="3" name="description" value={this.state.description} onChange={(event) => this.onFieldInput("description", event.target.value)}></textarea>
          <input className={buttonStyles.button} type="submit" value="Create Account" />
        </form>
      </div>
    );
  }
}
