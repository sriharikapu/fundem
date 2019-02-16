import React, { Component } from "react";
import styles from './UserList.module.scss';

export default class UserList extends Component {
  render()  {
    const { users } = this.props;
    const userAddresses = Object.keys(users);

    return (
      <ul className={styles.usersList}>
        {userAddresses.map((address, index) => (
          <li key={`user-${index}`}>
            <a href={`/user/${address}`} onClick={(event) => this.props.setRoute(`/user/${address}`, event)}>
              <h1>{users[address].title}</h1>
              <p>{users[address].description}</p>
            </a>
          </li>
        ))}
      </ul>
    );
  }
}
