import { Button, Flex, List, NavBar, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import earthImg from '../../../assets/earth.png';
import { toFra } from '../../../utils';
import styles from './tx.css';

function Record(props) {
  const {
    currentTxs,
    passes,
    dispatch,
    match: {
      params: { txId },
    },
    location: {
      query: { origin },
    },
  } = props;

  const txMeta = currentTxs.filter(tx => String(tx.id) === txId)[0] || { txParams: {} };
  const siteMeta = passes[origin] || {};

  const handlePublish = () => {
    dispatch({
      type: 'pihsiu/publishTx',
      payload: { txId },
    });
  };

  const handleReject = () => {
    dispatch({
      type: 'pihsiu/rejectTx',
      payload: { txId },
    });
  };

  const {
    txParams: { from, to, gas, gasPrice = 0, value: amount = 0 },
    txReceipt = {},
  } = txMeta;

  let statusImg = siteMeta.icon || earthImg;

  return (
    <div className="miniContainer">
      <NavBar>
        <FormattedMessage id="transaction.confirm" />
      </NavBar>
      <div style={{ background: '#4B4185', height: 40 }} />
      <Flex justify="center" align="center" className={styles.circle}>
        <img style={{ width: 45 }} src={statusImg} alt="status" />
      </Flex>
      <WingBlank>
        <Flex justify="between" className={styles.amountBox}>
          <Flex.Item />
          <Flex.Item className={styles.amount}>{toFra(parseInt(amount))}</Flex.Item>
          <Flex.Item className={styles.actions} />
        </Flex>

        <List className={styles['detail-list']}>
          <List.Item>
            <FormattedMessage id="tx.origin" />
            <List.Item.Brief>{siteMeta.name}</List.Item.Brief>
          </List.Item>
          <List.Item>
            <FormattedMessage id="from" />
            <List.Item.Brief>{from}</List.Item.Brief>
          </List.Item>
          <List.Item>
            <FormattedMessage id="recipient" />
            <List.Item.Brief>{to}</List.Item.Brief>
          </List.Item>
          <List.Item>
            <FormattedMessage id="gasFee"/>
            <List.Item.Brief>{`${parseInt(gas)} x ${parseInt(gasPrice)}`}</List.Item.Brief>
          </List.Item>
        </List>
        <div className={styles.warning}>
          来自Dapp的交易发送请求，请确认来源网址准确无误 -- {origin}
        </div>
        <div className="divider" style={{ margin: '20px 0' }} />
        <Flex>
          <Flex.Item>
            <Button type="ghost" onClick={handleReject}>
              <FormattedMessage id="reject"/>
            </Button>
          </Flex.Item>
          <Flex.Item>
            <Button type="primary" onClick={handlePublish}>
              <FormattedMessage id="send"/>
            </Button>
          </Flex.Item>
        </Flex>
      </WingBlank>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  currentTxs: pihsiu.transactions.records || [],
  passes: pihsiu.auth.passes || {},
}))(Record);
