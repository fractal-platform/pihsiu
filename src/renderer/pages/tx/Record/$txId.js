import AntdIcon from '@ant-design/icons-react';
import { Flex, Icon, List, NavBar, Toast, WingBlank } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { connect } from 'dva';
import { useEffect } from 'react';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import failImg from '../../../assets/fail.png';
import successImg from '../../../assets/success.png';
import waitImg from '../../../assets/wait.png';
import TxLogs from '../../../components/TxLogs';
import { toFra } from '../../../utils';
import styles from './Record.css';

function Record(props) {
  const {
    currentTxs = [],
    scanUrl,
    dispatch,
    match: {
      params: { txId },
    },
  } = props;

  const openExplorer = () => {
    if (scanUrl) {
      dispatch({
        type: 'pihsiu/openWindow',
        payload: { url: scanUrl },
      });
    } else {
      Toast.fail(formatMessage({ id: 'no.scanUrl.specified' }));
    }
  };

  useEffect(() => {
    dispatch({
      type: 'pihsiu/filterCurrentTxs',
    });
  }, [dispatch]);

  const txMeta = currentTxs.filter(tx => String(tx.id) === txId)[0] || { txParams: {} };

  const {
    hash = 'no hash yet',
    status,
    err,
    type,
    txParams: { from, to, gasPrice = 0, value: amount = 0 },
    txReceipt = {},
    history = [],
  } = txMeta;

  const { contractAddress, gasUsed = 0, status: wasmStatus = 1 } = txReceipt;

  let statusImg = ['receipt', 'confirmed'].includes(status)
    ? successImg
    : ['failed', 'timeout'].includes(status)
    ? failImg
    : waitImg;

  return (
    <div className="miniContainer">
      <NavBar
        icon={<Icon type="left" />}
        onLeftClick={() => {
          router.goBack();
        }}
      >
        <FormattedMessage id="transaction.record" />
      </NavBar>
      <div style={{ background: '#4B4185', height: 40 }} />
      <Flex justify="center" align="center" className={styles.circle}>
        <img style={{ width: 45 }} src={statusImg} alt="status" />
      </Flex>
      <WingBlank>
        <Flex justify="between" className={styles.amountBox}>
          <Flex.Item />
          <Flex.Item className={styles.amount}>{toFra(parseInt(amount))}</Flex.Item>
          <Flex.Item className={styles.actions}>
            <AntdIcon
              type="copy-o"
              style={{ marginBottom: 7, cursor: 'pointer' }}
              onClick={() => {
                if (copy(hash)) {
                  Toast.success('copied');
                }
              }}
            />
            <AntdIcon
              type="share-alt-o"
              style={{ margin: '7px 5px', cursor: 'pointer' }}
              onClick={() => {
                openExplorer();
              }}
            />
          </Flex.Item>
        </Flex>

        <List className={styles['detail-list']}>
          {['failed', 'timeout'].includes(status) ? (
            <List.Item multipleLine wrap>
              <FormattedMessage id="error.message" />
              <List.Item.Brief>{err.message}</List.Item.Brief>
            </List.Item>
          ) : (
            <List.Item>
              <FormattedMessage id="tx.hash" />
              <List.Item.Brief>{hash}</List.Item.Brief>
            </List.Item>
          )}
          {!wasmStatus && (
            <List.Item multipleLine wrap>
              <FormattedMessage id="error.message" />
              <List.Item.Brief>
                Running contract method failed. Some contract internal error happened.
              </List.Item.Brief>
            </List.Item>
          )}
          <List.Item>
            <FormattedMessage id="from" />
            <List.Item.Brief>{from}</List.Item.Brief>
          </List.Item>
          {to && (
            <List.Item>
              <FormattedMessage id="recipient" />
              <List.Item.Brief>{to}</List.Item.Brief>
            </List.Item>
          )}
          {type === 'deploy' && (
            <List.Item>
              <FormattedMessage id="contract.address" />
              <List.Item.Brief>{contractAddress}</List.Item.Brief>
            </List.Item>
          )}
          <List.Item>
            <FormattedMessage id="gasUsed" />
            <List.Item.Brief>{`${parseInt(gasUsed)} x ${gasPrice}`}</List.Item.Brief>
          </List.Item>
        </List>

        <div style={{ margin: '15px 0 0 0', color: '#757575' }}>
          <FormattedMessage id="activity.log" />
        </div>
        <div className="divider" style={{ margin: '5px 0 10px 0' }} />
        <TxLogs history={history} />
      </WingBlank>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  currentTxs: pihsiu.transactions.accessable,
  scanUrl: pihsiu.network.current.scanUrl,
}))(Record);
