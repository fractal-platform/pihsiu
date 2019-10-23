import AntdIcon from '@ant-design/icons-react';
import {
  Badge,
  Button,
  Card,
  Flex,
  List,
  ListView,
  Toast,
  WhiteSpace,
  WingBlank,
} from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { connect } from 'dva';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import sentImg from '../../assets/sendout.png';
import { AccountCard } from '../../components/AccountCard';
import BaseNavBar from '../../components/BaseNavBar';
import { toFra, totalAmount } from '../../utils';
import styles from './Home.css';

function ListBody(props) {
  return (
    <div style={{ width: '100%', display: 'block', position: 'absolute' }}>{props.children}</div>
  );
}

let pageIndex = 0;
const pageSize = 10;

function Home(props) {
  const { selectedAddress, selectedNetwork, balance, txs, identities, dispatch } = props;

  const selectedName = identities[selectedAddress] ? identities[selectedAddress].name : '';

  const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
  const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

  const ds = new ListView.DataSource({
    getRowData,
    getSectionHeaderData: getSectionData,
    rowHasChanged: (row1, row2) => row1 !== row2,
    sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
  });

  const [dataSource, setDataSource] = useState(ds);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCard, setShowCard] = useState(false);

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

  txs.sort((a, b) => {
    if (a.status === 'submitted' && b.status !== 'submitted') {
      return -1;
    }
    if (a.status !== 'submitted' && b.status === 'submitted') {
      return 1;
    }
    return b.submittedTime - a.submittedTime;
  });

  const getTxData = (pageIndex = 0) => {
    const dataLen = (pageIndex + 1) * pageSize;
    const data = txs.slice(0, Math.min(dataLen, txs.length));

    const dataBlobs = {};
    const sectionIDs = [];
    const rowIDs = [];
    for (let s = 0; s <= pageIndex; s++) {
      sectionIDs.push(`S${s}`);
      dataBlobs[`S${s}`] = `S${s}`;
      const rows = [];
      for (let r = 0; r < pageSize; r++) {
        const offset = s * pageSize + r;
        if (data[offset]) {
          rows.push(`S${s}R${r}`);
          dataBlobs[`S${s}R${r}`] = data[offset];
        }
      }
      rowIDs.push(rows);
    }

    return { dataBlobs, sectionIDs, rowIDs, hasMore: dataLen < txs.length };
  };

  useEffect(() => {
    log.debug('home see me too much means bug', txs);
    const { dataBlobs, sectionIDs, rowIDs } = getTxData(0);
    setDataSource(dataSource.cloneWithRowsAndSections(dataBlobs, sectionIDs, rowIDs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs]);

  const extra = (money, status) => {
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

  const row = (rowData, sectionID, rowID) => {
    const {
      hash,
      submittedTime,
      status,
      txParams: { value, gas, gasPrice },
    } = rowData;

    return (
      <List.Item
        thumb={sentImg}
        extra={extra(totalAmount(value, gas, gasPrice), status)}
        onClick={() => {
          router.push(`/tx/record/${rowData.id}`);
        }}
      >
        <span style={{ fontSize: 14 }}>{hash}</span>
        <List.Item.Brief style={{ fontSize: 12 }}>
          {new Date(submittedTime).toLocaleString()}
        </List.Item.Brief>
      </List.Item>
    );
  };

  const onEndReached = () => {
    if (isLoading && !hasMore) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const { dataBlobs, sectionIDs, rowIDs, hasMore } = getTxData(++pageIndex);
      setHasMore(hasMore);
      setDataSource(dataSource.cloneWithRowsAndSections(dataBlobs, sectionIDs, rowIDs));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <BaseNavBar mode="light" />
      <WhiteSpace />
      <WingBlank>
        <Card className={styles.card}>
          <Card.Header
            title={
              <span className={styles.cardTitle} onClick={() => setShowCard(true)}>
                {selectedAddress}
              </span>
            }
            thumb={
              <Jazzicon
                diameter={25}
                seed={jsNumberForAddress(selectedAddress || '0x01')}
                onClick={() => setShowCard(true)}
              />
            }
            extra={
              <span>
                <AntdIcon
                  style={{ marginRight: '5px', color: '#fff' }}
                  type="copy-o"
                  onClick={() => {
                    if (copy(selectedAddress)) {
                      Toast.success('Copied');
                    }
                  }}
                />
                <AntdIcon
                  className={styles.whiteFont}
                  type="qrcode-o"
                  onClick={() => setShowCard(true)}
                />
              </span>
            }
          />
          <Card.Body>
            <Flex direction="column" align="center">
              <div className={styles.greyFont}>
                <FormattedMessage id="assets" />
                (Fractal)
              </div>
              <h1 className={styles.whiteFont}>{toFra(balance)}</h1>
            </Flex>
          </Card.Body>
          <Card.Footer
            style={{ padding: 'unset' }}
            content={
              <Button
                id="left"
                className={styles.cardFooterLeft}
                type="primary"
                size="small"
                onClick={() => {
                  router.push('/tx/receive');
                }}
              >
                <FormattedMessage id="deposit" />
              </Button>
            }
            extra={
              <Button
                id="right"
                className={styles.cardFooterRight}
                type="primary"
                size="small"
                onClick={() => {
                  router.push('/tx/send');
                }}
              >
                <FormattedMessage id="send" />
              </Button>
            }
          />
        </Card>
        <ListView
          dataSource={dataSource}
          renderHeader={() => <FormattedMessage id="transactions" />}
          renderFooter={() => (
            <div style={{ padding: 30, textAlign: 'center' }}>
              {isLoading ? 'Loading...' : 'Nothing More'}
            </div>
          )}
          renderBodyComponent={() => <ListBody />}
          renderRow={row}
          style={{
            height: '300px',
            overflow: 'auto',
            width: '100%',
          }}
          pageSize={4}
          scrollRenderAheadDistance={500}
          onEndReached={onEndReached}
          onEndReachedThreshold={10}
        />
      </WingBlank>
      <AccountCard
        visible={showCard}
        onClose={() => setShowCard(false)}
        onPrivateKey={handlePrivateKey}
        onScan={handleScan}
        name={selectedName}
        address={selectedAddress || '0x01'}
      />
    </div>
  );
}

const mapStateToProps = ({ pihsiu }) => {
  return {
    identities: pihsiu.accounts.identities || {},
    selectedAddress: pihsiu.accounts.selectedAddress,
    selectedNetwork: pihsiu.network.current,
    balance: pihsiu.balances.current,
    txs: pihsiu.transactions.accessable || [],
  };
};

export default connect(mapStateToProps)(Home);
