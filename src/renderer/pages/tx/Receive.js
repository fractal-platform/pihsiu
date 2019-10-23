import { Button, Flex, Icon, NavBar, Toast, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { useState } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import bitcoin from '../../assets/bitcoin.png';
import faucet from '../../assets/faucet.png';
import { AccountCard } from '../../components/AccountCard';
import styles from './Receive.css';

function Receive(props) {
  const { dispatch, faucetUrl, scanUrl, selectedAddress, identities = {} } = props;
  const [showCard, setShowCard] = useState(false);

  const selectedName = identities[selectedAddress] ? identities[selectedAddress].name : '';

  const handlePrivateKey = address => {
    return dispatch({
      type: 'pihsiu/exportAccount',
      payload: { address },
    });
  };

  const handleScan = () => {
    if (scanUrl) {
      dispatch({
        type: 'pihsiu/openWindow',
        payload: { url: scanUrl },
      });
    } else {
      Toast.fail(formatMessage({ id: 'no.scanUrl.specified' }));
    }
  };

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="receive.tokens" />
      </NavBar>
      <WingBlank>
        <Flex direction="column" align="center" style={{ margin: '30px 0 30px 0' }}>
          <img style={{ width: '30px', height: '30px' }} src={bitcoin} alt="" />
        </Flex>
        <div className={styles.title}>
          <FormattedMessage id="directly.deposit" />
        </div>
        <WhiteSpace />
        <span className={styles.description}>
          <FormattedMessage id="directly.deposit.description" />
        </span>
        <Button
          type="primary"
          style={{ margin: '40px 0 16px 0', cursor: 'pointer' }}
          onClick={() => setShowCard(true)}
        >
          <FormattedMessage id="view.account" />
        </Button>

        <AccountCard
          visible={showCard}
          onClose={() => setShowCard(false)}
          onPrivateKey={handlePrivateKey}
          onScan={handleScan}
          name={selectedName}
          address={selectedAddress || '0x01'}
        />

        <div className="divider" style={{ margin: '24px 0' }} />

        {faucetUrl && (
          <div>
            <Flex direction="column" align="center" style={{ margin: '30px 0 30px 0' }}>
              <img style={{ width: '30px', height: '30px' }} src={faucet} alt="" />
            </Flex>
            <div className={styles.title}>
              <FormattedMessage id="test.faucet" />
            </div>
            <WhiteSpace />
            <span className={styles.description}>
              <FormattedMessage id="test.faucet.description" />
            </span>
            <Button
              type="primary"
              style={{ margin: '40px 0 16px 0', cursor: 'pointer' }}
              onClick={() => {
                dispatch({
                  type: 'pihsiu/openWindow',
                  payload: { url: faucetUrl },
                });
              }}
            >
              <FormattedMessage id="test.faucet" />
            </Button>
          </div>
        )}
      </WingBlank>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  faucetUrl: pihsiu.network.current.faucetUrl,
  scanUrl: pihsiu.network.current.scanUrl,
  selectedAddress: pihsiu.accounts.selectedAddress,
  identities: pihsiu.accounts.identities,
}))(Receive);
