import React from 'react';
import styles from './header.module.scss';

export default class Header extends React.Component {
  render () {
    const { setRoute, web3Ready } = this.props;
    return <div className={styles.header}>
      <nav id="menu" className="menu">
        <div className={styles.brand}>
          <a href="/" onClick={(event) => setRoute("", event)} className={styles.link}>fundem</a>
          {!web3Ready && <div className={styles.loaderSuccess}>
            <span className={styles.indicator}></span>
            <span className={styles.description}>Connect with MetaMask</span>
          </div>}
        </div>
        <ul>
          <li><a href="/" onClick={(event) => setRoute("", event)}  className={styles.link}>Home</a></li>
          <li><a href="/createUser" onClick={(event) => setRoute("createUser", event)} className={styles.link}>Create Account</a></li>
        </ul>
      </nav>
    </div>;
  }
}
