import { ActivityIndicator, Toast } from 'antd-mobile';
import { connect } from 'dva';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import styles from './index.css';

function BasicLayout(props) {
  const [animating, setAnimating] = useState(false);
  const { dispatch, chainId, connected, isInitialized, isUnlocked } = props;

  useEffect(() => {
    let timeouts = [];
    log.debug(isInitialized, isUnlocked, chainId, connected);
    if (!isInitialized || !isUnlocked) {
      return;
    }
    if (chainId === 'loading' && connected !== 'fail') {
      timeouts.push(
        setTimeout(() => {
          setAnimating(chainId === 'loading');
        }, 1000),
      );

      timeouts.push(
        setTimeout(() => {
          if (chainId === 'loading') {
            setAnimating(false);
            Toast.fail('Connect failed. Try another.');
            dispatch({ type: 'global/setConnected', payload: 'fail' });
          }
        }, 5 * 1000),
      );
    } else if (chainId !== 'loading') {
      setAnimating(false);
      dispatch({ type: 'global/setConnected', payload: 'success' });
    }
    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [isInitialized, isUnlocked, chainId, connected, dispatch]);

  return (
    <div className={styles.mainContent}>
      <div className={styles.normal}>
        <ActivityIndicator toast size="large" text="connecting..." animating={animating} />
        {props.children}
      </div>
    </div>
  );
}

export default connect(({ pihsiu, global }) => ({
  isInitialized: pihsiu.isInitialized,
  isUnlocked: pihsiu.accounts.isUnlocked,
  chainId: pihsiu.network.chainId,
  connected: global.connected,
}))(BasicLayout);
