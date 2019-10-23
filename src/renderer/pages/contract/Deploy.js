import {
  Button,
  Card,
  Flex,
  Icon,
  InputItem,
  List,
  Modal,
  Slider,
  Switch,
  Toast,
  WhiteSpace,
  WingBlank,
} from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import dollarPng from '../../assets/dollar.png';
import BaseNavBar from '../../components/BaseNavBar';
import UploadBtn from '../../components/UploadBtn';
import { bufferToHex, fraToLei, toFra, totalAmount, validAmount, validJson } from '../../utils';
import styles from './index.css';

function calcGasLimit(wasmFile) {
  const fileSize = wasmFile ? wasmFile.byteLength : 1;
  return {
    min: 500 * 10000 + fileSize * 26800,
    default: 500 * 10000 + fileSize * 31800,
    max: 500 * 10000 + fileSize * 368000,
  };
}

function Deploy(props) {
  const {
    form: { getFieldDecorator, getFieldValue, getFieldError, validateFields },
    selectedAddress,
    defaultGasPrice,
    balance,
    dispatch,
  } = props;

  const [isAdvance, setAdvance] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const amount = getFieldValue('amount');
  const gas = getFieldValue('gas');
  const gasPrice = getFieldValue('gasPrice') || defaultGasPrice;

  const onCancel = () => {
    setShowPopup(false);
  };

  const onSubmit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input');
      } else {
        value.data = bufferToHex(value.data);
        dispatch({
          type: 'pihsiu/deployContract',
          payload: {
            txParams: {
              from: value.from,
              data: value.data,
              value: fraToLei(value.amount),
              gas: value.gas,
              gasPrice: fraToLei(value.gasPrice),
            },
            name: value.name,
            abi: value.abi,
            isUpload2Browser: value.isUpload2Browser,
          },
        });
      }
    });
  };

  return (
    <div className="miniContainer">
      <BaseNavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.push('/')}>
        <FormattedMessage id="deploy.contract" />
      </BaseNavBar>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="owner" />
          </span>
        )}
      >
        {getFieldDecorator('from', {
          initialValue: selectedAddress,
          rules: [{ required: true }],
        })(
          <InputItem
            disabled
            placeholder="from"
            error={getFieldError('from')}
            onErrorClick={() => {
              Toast.fail(getFieldError('from').join(','));
            }}
          >
            <Jazzicon diameter={25} seed={jsNumberForAddress(getFieldValue('from'))} />
          </InputItem>,
        )}
      </List>
      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="contract.name" />
          </span>
        )}
      >
        {getFieldDecorator('name', { rules: [{ required: true }] })(
          <InputItem
            clear
            placeholder={formatMessage({ id: 'contract.name' })}
            error={getFieldError('name')}
            onErrorClick={() => {
              Toast.fail(getFieldError('name').join(','));
            }}
          />,
        )}
      </List>
      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="balance" />
            {`(${formatMessage({ id: 'initial.contract.balance' })})`}
          </span>
        )}
      >
        {getFieldDecorator('amount', {
          initialValue: 0,
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                const errors = [];
                const error = validAmount(value, 0, balance);
                if (error) errors.push(error);
                cb([]);
              },
            },
          ],
        })(
          <InputItem
            clear
            placeholder={`${formatMessage({ id: 'available.balance' })}: ${balance}`}
            extra="FRA"
            error={getFieldError('amount')}
            onErrorClick={() => {
              Toast.fail(getFieldError('amount').join(','));
            }}
          />,
        )}
      </List>
      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="byte.code" />
          </span>
        )}
      >
        {getFieldDecorator('data', { rules: [{ required: true }] })(
          <UploadBtn
            id="uploadByteCode"
            placeholder={formatMessage({ id: 'please.choose.byte.code.file' })}
            suffixs={['wasm']}
            error={getFieldError('data')}
          >
            <FormattedMessage id="choose.file" />
          </UploadBtn>,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="abi.file" />
          </span>
        )}
      >
        {getFieldDecorator('abi', {
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                var errors = [];
                const error = validJson(value);
                if (error) errors.push(error);
                cb(errors);
              },
            },
          ],
        })(
          <UploadBtn
            id="uploadAbi"
            contentType="text"
            placeholder={formatMessage({ id: 'please.choose.abi.file' })}
            suffixs={['abi', 'json']}
            error={getFieldError('abi')}
          >
            <FormattedMessage id="choose.file" />
          </UploadBtn>,
        )}
        <List.Item
          extra={getFieldDecorator('isUpload2Browser', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Switch />)}
        >
          <span className={styles.title}>
            <FormattedMessage id="is.upload.abi.to.scan" />
          </span>
        </List.Item>
      </List>

      <div className={styles.listTitle}>Gas</div>
      {!isAdvance && (
        <WingBlank className={styles.gasSlider}>
          {getFieldDecorator('gas', {
            initialValue: calcGasLimit(getFieldValue('data')).default,
          })(
            <Slider
              min={calcGasLimit(getFieldValue('data')).min}
              max={calcGasLimit(getFieldValue('data')).max}
            />,
          )}
          <Flex justify="between" style={{ marginTop: 20 }}>
            <Flex.Item style={{ color: '#757575' }}>
              <FormattedMessage id="slow" />
            </Flex.Item>
            <Flex.Item style={{ color: '#757575', textAlign: 'center' }}>
              {getFieldValue('gas')}
            </Flex.Item>
            <Flex.Item style={{ color: '#757575', textAlign: 'right' }}>
              <FormattedMessage id="fast" />
            </Flex.Item>
          </Flex>
        </WingBlank>
      )}

      {isAdvance && (
        <List style={{ marginBottom: 10 }}>
          {getFieldDecorator('gas')(<InputItem clear placeholder="Gas" />)}
          {getFieldDecorator('gasPrice', {
            initialValue: 1e-9,
          })(<InputItem clear placeholder="GasPrice" extra="FRA"/>)}
        </List>
      )}

      <WingBlank>
        <Flex justify="end">
          <div style={{ marginRight: 5, fontSize: 12, color: '#757575' }}>
            <FormattedMessage id="advanced" />
          </div>
          <List style={{ background: '#f5f5f9' }}>
            <Switch
              checked={isAdvance}
              onChange={() => {
                setAdvance(!isAdvance);
              }}
            />
          </List>
        </Flex>
      </WingBlank>

      <WhiteSpace size="xl" />

      <Button
        type="primary"
        onClick={() => {
          validateFields(error => {
            if (error) {
              Toast.fail('Invalid Input');
            } else {
              setShowPopup(!showPopup);
            }
          });
        }}
      >
        <FormattedMessage id="next.step" />
      </Button>

      <Modal
        popup
        visible={showPopup}
        onClose={() => {
          setShowPopup(!showPopup);
        }}
        animationType="slide-up"
      >
        <Card full style={{ width: '100%', height: '430px' }}>
          <Card.Header title={formatMessage({ id: 'the.summary' })} />
          <Card.Body>
            <List>
              <List.Item
                extra={getFieldValue('from')}
                align="top"
                thumb={
                  <Jazzicon
                    paperStyles={{ marginTop: 6 }}
                    diameter={22}
                    seed={jsNumberForAddress(selectedAddress)}
                  />
                }
                multipleLine
              >
                <FormattedMessage id="owner" />
              </List.Item>
              <List.Item extra={amount + 'FRA'} align="top" thumb={dollarPng} multipleLine>
                <FormattedMessage id="balance" />
              </List.Item>
              <List.Item
                extra={totalAmount(0, gas, gasPrice)}
                align="top"
                thumb={dollarPng}
                multipleLine
              >
                <FormattedMessage id="gasFee" />{' '}
                <List.Item.Brief>{`${gas} * ${gasPrice}`}</List.Item.Brief>
              </List.Item>
              <List.Item
                extra={totalAmount(amount, gas, gasPrice)}
                align="top"
                thumb={dollarPng}
                multipleLine
              >
                <FormattedMessage id="total" />
                <List.Item.Brief>{`${amount} + ${totalAmount(0, gas, gasPrice)}`}</List.Item.Brief>
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
      </Modal>
    </div>
  );
}

const mapStateToProps = ({ pihsiu }) => {
  return {
    selectedAddress: pihsiu.accounts.selectedAddress || '0x01',
    defaultGasPrice: toFra(pihsiu.preferences.defaultGasPrice),
    balance: toFra(pihsiu.balances.current),
  };
};

export default connect(mapStateToProps)(createForm()(Deploy));
