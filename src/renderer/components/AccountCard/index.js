import AntdIcon from '@ant-design/icons-react';
import { Flex, Modal, TextareaItem, Toast, WhiteSpace } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import styles from './index.css';
import QRCode from 'qrcode.react';

export function AccountCard(props) {
  const { visible, onClose, onPrivateKey, onScan, name, address } = props;

  const [showPK, setShowPK] = useState(false);
  const [pk, setPk] = useState('');

  const handlePkClick = () => {
    if (onPrivateKey) {
      onPrivateKey(address).then(pk => {
        setPk(pk);
        setShowPK(true);
      });
    }
  };

  const handleClose = () => {
    onClose();
    setPk('');
    setShowPK(false);
  };

  const header = (
    <div style={{}}>
      <Flex justify="center" align="center" className={styles.circle}>
        <Jazzicon diameter={49} seed={jsNumberForAddress(address)} />
      </Flex>
      <Flex className={styles.headInfo} direction="column" justify="center" align="center">
        <Flex.Item className={styles.name}>{name}</Flex.Item>
        <Flex.Item className={styles.address}>
          <div>{`${address} `}</div>
          <AntdIcon
            type="copy-o"
            onClick={() => {
              copy(address);
              Toast.info('copied');
            }}
          />
        </Flex.Item>
      </Flex>
    </div>
  );

  return (
    <Modal
      className={styles.card}
      visible={visible}
      closable
      transparent
      title={header}
      footer={[
        { text: formatMessage({ id: 'private.key' }), onPress: handlePkClick },
        { text: formatMessage({ id: 'view.scan' }), onPress: onScan },
      ]}
      onClose={handleClose}
    >
      <WhiteSpace size="lg" />
      {showPK ? (
        <Flex direction="column" justify="center" align="center">
          <span style={{ color: '#e7a644' }}>
            <FormattedMessage id="private.key.warning" />
          </span>
          <WhiteSpace />
          <div className={styles.privateKey}>
            <TextareaItem rows={5} defaultValue={pk} />
          </div>
        </Flex>
      ) : (
        <Flex direction="column" justify="center" align="center">
          <FormattedMessage id="qr.code" />
          <WhiteSpace />
          <QRCode value={address} />
        </Flex>
      )}
      <WhiteSpace size="lg" />
    </Modal>
  );
}
