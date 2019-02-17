import React from 'react';
import styles from './footer.module.scss';

export default class Footer extends React.Component {
  txCompleteInterval = undefined;
  state = {
    txActive: false,
    txComplete: false
  };

  showTxProcessing = () => {
    this.setState({ txActive: true, txComplete: false });
  };

  showTxResult = () => {
    this.setState({ txActive: false, txComplete: true });
    this.txCompleteInterval = setInterval(this.clearTxResult, 3000);
  };

  clearTxResult = () => {
    this.setState({ txActive: false, txComplete: false });
    clearInterval(this.txCompleteInterval);
    this.txCompleteInterval = undefined;
  };

  render () {
    const { currentTx } = this.props;
    const { description, isWorking, isSuccess } = currentTx;
    const { txActive, txComplete } = this.state;
    let className = styles.txDormant;
    if (txActive) className = styles.txActive;
    else if (txComplete && isSuccess) className = styles.txSuccess;
    else if (txComplete && !isSuccess) className = styles.txFailure;

    return <div className={txActive || txComplete ? styles.isVisible : styles.isHidden}>
      <div className={className}>
        {description}
      </div>
    </div>;
  }
}
