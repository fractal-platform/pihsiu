import AntdIcon from '@ant-design/icons-react';
import { Button, Card, Flex, List } from 'antd-mobile';
import classNames from 'classnames';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import dollarPng from '../../assets/dollar.png';
import styles from './index.css';

function TxPopup(props) {
  const { from, to, amount, gas, gasPrice, onSubmit, onCancel } = props;

  const gasFee = (gas, gasPrice) => {
    return gas * gasPrice;
  };

  const total = (amount, gasFee) => {
    return parseFloat(amount) + parseFloat(gasFee);
  };

  return (
    <Card full style={{ width: '100%', height: '430px' }}>
      <Card.Header title={formatMessage({ id: 'the.summary' })} />
      <Card.Body>
        <div className={styles['address-group']}>
          <div className={classNames(styles['address-box'], styles['address-left'])}>
            <span style={{ height: 25 }}>
              <Jazzicon diameter={25} seed={jsNumberForAddress(from)} />
            </span>
            <span className={styles.address}>{from}</span>
          </div>
          <div className={styles['address-arrow']}>
            <div className={styles['arrow-circle']}>
              <AntdIcon type="right-o" />
            </div>
          </div>
          <div className={classNames(styles['address-box'], styles['address-right'])}>
            <span style={{ height: 25 }}>
              <Jazzicon diameter={25} seed={jsNumberForAddress(to)} />
            </span>
            <span className={styles.address}>{to}</span>
          </div>
        </div>

        <Flex direction="column" justify="begin" className={styles['summary-container']}>
          <div className={styles['action-title']}>
            <FormattedMessage id="amount" />
          </div>
          <div className={styles['action-value']}>{amount}</div>
        </Flex>

        <List>
          <List.Item extra={gasFee(gas, gasPrice)} align="top" thumb={dollarPng} multipleLine>
            <FormattedMessage id="gasFee" />{' '}
            <List.Item.Brief>{`${gas} * ${gasPrice}`}</List.Item.Brief>
          </List.Item>
          <List.Item
            extra={total(amount, gasFee(gas, gasPrice))}
            align="top"
            thumb={dollarPng}
            multipleLine
          >
            <FormattedMessage id="total" />
            <List.Item.Brief>{`${amount} + ${gasFee(gas, gasPrice)}`}</List.Item.Brief>
          </List.Item>
        </List>
      </Card.Body>
      <Card.Footer
        content={
          <Button type="ghost" style={{ marginRight: '15px' }} onClick={onCancel}>
            <FormattedMessage id="cancel" />
          </Button>
        }
        extra={
          <Button type="primary" onClick={onSubmit}>
            <FormattedMessage id="submit" />
          </Button>
        }
      />
    </Card>
  );
}

export default TxPopup;
