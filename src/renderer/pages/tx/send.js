import AntdIcon from '@ant-design/icons-react';
import {
  Button,
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
import { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import BaseNavBar from '../../components/BaseNavBar';
import SelectInput from '../../components/SelectInput';
import TxPopup from '../../components/TxPopup';
import { fraToLei, toFra, validAddress, validAmount } from '../../utils';
import styles from './send.css';

function Send(props) {
  const {
    dispatch,
    selectedAddress,
    identities,
    gasPrice,
    balance,
    form: { getFieldDecorator, getFieldValue, validateFields, getFieldError },
  } = props;

  useEffect(() => {
    dispatch({
      type: 'pihsiu/getDefaultGasPrice',
    });
  }, [gasPrice, dispatch]);

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input');
      } else {
        value.value = fraToLei(value.value);
        value.gasPrice = fraToLei(value.gasPrice);
        dispatch({
          type: 'pihsiu/sendTx',
          txParams: value,
        });
      }
    });
  };

  const menuData = Object.keys(identities).map(key => ({
    value: key,
    label: (
      <span>
        <Jazzicon
          paperStyles={{ marginBottom: -2, marginRight: 5 }}
          diameter={18}
          seed={jsNumberForAddress(key)}
        />
        {`  ${identities[key].name}  ${key}`}
      </span>
    ),
  }));

  const [isAdvance, setAdvance] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="miniContainer">
      <BaseNavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="transfer" />
      </BaseNavBar>

      <WhiteSpace />

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="from" />
          </span>
        )}
      >
        {getFieldDecorator('from', {
          initialValue: selectedAddress,
          rules: [{ required: true }],
        })(
          <InputItem
            disabled
            placeholder={formatMessage({ id: 'from' })}
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
            <FormattedMessage id="recipient" />
          </span>
        )}
      >
        {getFieldDecorator('to', {
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                const error = validAddress(value);
                cb(error ? [error] : []);
              },
            },
          ],
        })(
          <SelectInput
            placeholder={formatMessage({ id: 'recipient.account' })}
            data={menuData}
            error={getFieldError('to')}
            onErrorClick={() => {
              Toast.fail(getFieldError('to').join(','));
            }}
          >
            {getFieldValue('to') ? (
              <Jazzicon diameter={25} seed={jsNumberForAddress(getFieldValue('to') || '0x01')} />
            ) : (
              <Flex
                style={{ width: 25, height: 25, borderRadius: 12, background: '#ddd' }}
                justify="center"
                align="center"
              >
                <AntdIcon type="user-o" />
              </Flex>
            )}
          </SelectInput>,
        )}
      </List>
      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="amount" />
          </span>
        )}
      >
        {getFieldDecorator('value', {
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                const error = validAmount(value, 0, balance);
                cb(error ? [error] : []);
              },
            },
          ],
        })(
          <InputItem
            clear
            extra="FRA"
            placeholder={`${formatMessage({ id: 'available.balance' })}: ${balance}`}
            error={getFieldError('value')}
            onErrorClick={() => {
              Toast.fail(getFieldError('value').join(','));
            }}
          />,
        )}
      </List>

      <div className={styles.listTitle}>Gas</div>
      {!isAdvance && (
        <WingBlank className={styles.gasSlider}>
          {getFieldDecorator('gas', {
            initialValue: 3000000,
          })(<Slider min={2000000} max={6000000}/>)}
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
        <TxPopup
          from={getFieldValue('from')}
          to={getFieldValue('to')}
          amount={getFieldValue('value')}
          gas={getFieldValue('gas')}
          gasPrice={getFieldValue('gasPrice') || gasPrice}
          onCancel={() => setShowPopup(false)}
          onSubmit={() => {
            setShowPopup(false);
            submit();
          }}
        />
      </Modal>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  selectedAddress: pihsiu.accounts.selectedAddress || '0x01',
  identities: pihsiu.accounts.identities || {},
  balance: toFra(pihsiu.balances.current),
  gasPrice: toFra(pihsiu.preferences.defaultGasPrice),
}))(createForm()(Send));
