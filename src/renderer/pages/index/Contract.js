import AntdIcon from '@ant-design/icons-react';
import { Badge, Grid, List, Tabs, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import BaseNavBar from '../../components/BaseNavBar';
import { toFra, totalAmount } from '../../utils';
import styles from './Contract.css';

function Contract({ scanUrl, accounts, myContract, txs, dispatch }) {
  const jump = href => {
    if (window.location.pathname === '/popup.html') {
      dispatch({
        type: 'pihsiu/openExtensionInBrowser',
        payload: { route: href },
      });
    } else {
      router.push(href);
    }
  };

  const handleShare = contractAddress => {
    dispatch({
      type: 'pihsiu/openContractInfoWindow',
      payload: {
        contractAddress,
        scanUrl,
      },
    });
  };

  const actions = [
    {
      icon: <AntdIcon className={styles.actionIcon} type="deployment-unit-o" />,
      text: formatMessage({ id: 'deploy' }),
      handleClick: () => jump('/contract/deploy'),
    },
    {
      icon: <AntdIcon className={styles.actionIcon} type="interaction-o" />,
      text: formatMessage({ id: 'interactive' }),
      handleClick: () => jump('/contract/interact'),
    },
    {
      icon: <AntdIcon className={styles.actionIcon} type="control-o" />,
      text: formatMessage({ id: 'manage' }),
      handleClick: () => jump('/contract/manage'),
    },
  ];

  const nothingDiv = (
    <div className={styles.tabContent}>
      <div className={styles.nothing}>
        <AntdIcon type="inbox-o" />
        <div>
          <FormattedMessage id="nothing.to.show" />
        </div>
      </div>
    </div>
  );

  const extra = contractAddress => (
    <div>
      <div className={styles.extraInfo}>
        {'owner: ' + accounts[myContract[contractAddress].owner].name}
      </div>
      <div className={styles.extraAction}>
        <AntdIcon
          type="copy-o"
          onClick={() => {
            if (copy(contractAddress)) {
              Toast.success('copied');
            }
          }}
        />
        <AntdIcon type="share-alt-o" onClick={() => handleShare(contractAddress)}/>
      </div>
    </div>
  );

  const myContractList = Object.keys(myContract).map((addr, i) => (
    <List.Item
      key={i}
      thumb={<AntdIcon type="file-protect-o" style={{ fontSize: 22, color: '#4B4185' }} />}
      extra={extra(addr)}
    >
      <span style={{ fontSize: 15 }}>{myContract[addr].name}</span>
      <List.Item.Brief style={{ fontSize: 12 }}>{addr}</List.Item.Brief>
    </List.Item>
  ));

  const hisExtra = (money, status) => {
    let backgroundColor = '#e7a644';
    if (['submitted'].includes(status)) {
      backgroundColor = '#673ab7';
    }
    if (['confirmed', 'receipt'].includes(status)) {
      backgroundColor = '#368e75';
    }

    return (
      <div>
        <div className={styles.extraInfo}>{toFra(money)}</div>
        <div>
          <Badge style={{ backgroundColor }} text={status} />
        </div>
      </div>
    );
  };

  const historyList = txs
    .filter(tx => ['deploy', 'call'].includes(tx.type))
    .map((tx, i) => (
      <List.Item
        extra={hisExtra(
          totalAmount(tx.txParams.value, tx.txParams.gas, tx.txParams.gasPrice),
          tx.status,
        )}
        onClick={() => {
          router.push(`/tx/record/${tx.id}`);
        }}
      >
        <Badge
          style={{
            padding: '0 3px',
            backgroundColor: '#fff',
            borderRadius: 2,
            color: '#f19736',
            border: '1px solid #f19736',
          }}
          text={tx.type}
        />
        <span style={{ fontSize: 14, marginLeft: 5 }}>{tx.hash || 'no hash'}</span>
        <List.Item.Brief style={{ fontSize: 12 }}>
          {tx.submittedTime ? new Date(tx.submittedTime).toLocaleString() : 'not valid time'}
        </List.Item.Brief>
      </List.Item>
    ));

  return (
    <div className="miniContainer">
      <BaseNavBar mode="light" />
      <Grid
        data={actions}
        columnNum={3}
        hasLine={false}
        className={styles.actionContainer}
        itemStyle={{ height: 71 }}
        activeClassName={styles.active}
        onClick={el => el.handleClick()}
      />
      <Tabs
        tabs={[
          { title: formatMessage({ id: 'my.contracts' }) },
          { title: formatMessage({ id: 'history' }) },
        ]}
        initialPage={0}
      >
        {isEmpty(myContractList) ? nothingDiv : <List>{myContractList}</List>}
        {isEmpty(historyList) ? nothingDiv : <List>{historyList}</List>}
      </Tabs>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  accounts: pihsiu.accounts.identities || {},
  myContract: pihsiu.contract.myContract || {},
  txs: pihsiu.transactions.records || [],
  scanUrl: pihsiu.network.current.scanUrl || '',
}))(Contract);
