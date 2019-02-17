import React from 'react';
import styles from './header.module.scss';

export default class Header extends React.Component {
  render () {
    const { setRoute } = this.props;

    return <div className={styles.header}>
      <nav id="menu" className="menu">
        <div className={styles.brand}>
          <a href="/" onClick={(event) => setRoute("/", event)} className={styles.link}>FundEm</a>
        </div>
        <ul>
          <li><a href="/" onClick={(event) => setRoute("/", event)}  className={styles.link}>Home</a></li>
          <li><a href="/createUser" onClick={(event) => setRoute("/createUser", event)} className={styles.link}>Create Account</a></li>
        </ul>
      </nav>
    </div>;
  }
}
