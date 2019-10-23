import { NavBar, NoticeBar, Toast } from 'antd-mobile';
import { connect } from 'dva';
import { useState } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import { AccountCard } from '../AccountCard';
import SelectAccount from '../SelectAccount';
import SelectNetwork from '../SelectNetwork';

function BaseNavBar(props) {
  const {
    global: { connected },
    selectedAddress,
    identities,
    providers,
    selectedNetwork,
    keyrings,
    dispatch,
    style,
    ...restProps
  } = props;

  const [showCard, setShowCard] = useState(false);

  const handleNetworkSelect = item => {
    const value = item.props.value;
    if (value === 'custom') {
      router.push('settings/net/customize');
    } else if (value === 'nodeList') {
      dispatch({
        type: 'pihsiu/openWindow',
        payload: {
          url: 'https://github.com/fractal-platform/pihsiu/wiki/Known-List-of-test-nodes',
        },
      });
    } else {
      const selected = providers.filter(p => p.rpcUrl === value)[0];
      dispatch({
        type: 'pihsiu/setNetwork',
        payload: selected,
      });
      dispatch({
        type: 'global/setConnected',
        payload: 'loading',
      });
    }
  };

  const handleAccountSelect = item => {
    if (item === 'create') {
      router.push('/account/add');
    } else if (item === 'export') {
      setShowCard(true);
    } else {
      dispatch({ type: 'pihsiu/setAccount', payload: { address: item } });
    }
  };

  const handlePrivateKey = address => {
    return dispatch({
      type: 'pihsiu/exportAccount',
      payload: { address },
    });
  };

  const handleScan = () => {
    if (selectedNetwork.scanUrl) {
      dispatch({
        type: 'pihsiu/openWindow',
        payload: { url: selectedNetwork.scanUrl },
      });
    } else {
      Toast.fail(formatMessage({ id: 'no.scanUrl.specified' }));
    }
  };

  const accounts = Object.keys(identities).map(k => identities[k]);

  const rightContent = [
    <SelectNetwork
      key={1}
      current={selectedNetwork}
      networks={providers}
      onSelect={handleNetworkSelect}
    />,
    <SelectAccount
      key={2}
      current={selectedAddress}
      accounts={accounts}
      keyrings={keyrings}
      onSelect={handleAccountSelect}
    />,
  ];

  const styles = {
    ...style,
  };

  return (
    <div>
      <NavBar style={styles} rightContent={rightContent} {...restProps} />
      {connected === 'fail' && (
        <NoticeBar mode="link">
          <FormattedMessage id="disconnect.notice" />
        </NoticeBar>
      )}
      <AccountCard
        visible={showCard}
        onClose={() => setShowCard(false)}
        onPrivateKey={handlePrivateKey}
        onScan={handleScan}
        name={identities[selectedAddress] ? identities[selectedAddress].name : ''}
        address={selectedAddress || '0x01'}
      />
    </div>
  );
}

export default connect(({ pihsiu, global }) => ({
  selectedAddress: pihsiu.accounts.selectedAddress || '0x01',
  identities: pihsiu.accounts.identities || {},
  keyrings: pihsiu.accounts.keyrings || [],
  providers: pihsiu.network.providers,
  selectedNetwork: pihsiu.network.current,
  global,
}))(BaseNavBar);
