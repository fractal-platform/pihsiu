import AntdIcon from '@ant-design/icons-react';
import {
  Button,
  Flex,
  Icon,
  InputItem,
  List,
  Modal,
  SegmentedControl,
  Slider,
  Switch,
  TextareaItem,
  Toast,
  WhiteSpace,
  WingBlank,
} from 'antd-mobile';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { createForm } from 'rc-form';
import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import BaseNavBar from '../../components/BaseNavBar';
import SelectInput from '../../components/SelectInput';
import TxPopup from '../../components/TxPopup';
import UploadBtn from '../../components/UploadBtn';
import {
  fraToLei,
  parseAbi,
  toFra,
  transformAbiData,
  validAbiData,
  validAddress,
  validAmount,
  validJson,
} from '../../utils';
import styles from './index.css';

function Interact(props) {
  const {
    form: { getFieldDecorator, getFieldValue, getFieldError, validateFields },
    selectedAddress,
    myContract,
    favourite,
    balance,
    defaultGasPrice,
    dispatch,
  } = props;

  const [isAdvance, setAdvance] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [action, setAction] = useState('Call');
  const [showAbi, setShowAbi] = useState(true);
  const [abi, setAbi] = useState(undefined);
  const [queryResult, setQueryResult] = useState('');

  const handleCall = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input');
      } else {
        const { from, to, amount, gas, gasPrice, actionName, actionData } = value;
        const newActionData = transformAbiData(actionData, selectAction.params);
        dispatch({
          type: 'pihsiu/callContract',
          payload: {
            callParams: { actionName, actionData: newActionData },
            txParams: { from, to, value: fraToLei(amount), gas, gasPrice: fraToLei(gasPrice) },
            abi,
          },
        });
      }
    });
  };

  const handleQuery = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input');
      } else {
        const { keys, tableName, to } = value;
        const newKeys = transformAbiData(keys, selectTable.key);
        dispatch({
          type: 'pihsiu/queryContract',
          payload: {
            abi,
            contractAddress: to,
            tableName,
            key: newKeys,
          },
        }).then(resp => {
          setQueryResult(resp.error || resp.payload);
        });
      }
    });
  };

  const handleToSelect = contractAddress => {
    dispatch({
      type: 'pihsiu/loadAbi',
      payload: { contractAddress },
    }).then(payload => {
      if (payload) {
        setAbi(payload);
        setShowAbi(false);
      } else if (!abi) {
        setAbi(undefined);
        setShowAbi(true);
      }
    });
  };

  const handleAbiSelect = abi => {
    setAbi(JSON.parse(abi));
  };

  const allContract = { ...myContract, ...favourite };
  const menuData = Object.keys(allContract).map(key => ({
    value: key,
    label: (
      <span>
        <Jazzicon
          paperStyles={{ marginBottom: -2, marginRight: 5 }}
          diameter={18}
          seed={jsNumberForAddress(key)}
        />
        {`  ${allContract[key].name}  ${key}`}
      </span>
    ),
  }));

  const abiObj = parseAbi(abi);

  const actionMenu = abiObj.actions.map(a => ({
    value: a.name,
    label: a.name,
  }));

  const selectAction = abiObj.actions.find(a => a.name === getFieldValue('actionName'));
  let paramList;
  if (selectAction) {
    paramList = Object.keys(selectAction.params).map(name => {
      return getFieldDecorator(`actionData.${name}`, {
        rules: [
          { required: true },
          {
            validator(_, value, cb) {
              const err = validAbiData(value, selectAction.params[name]);
              cb(err ? [err] : []);
            },
          },
        ],
      })(
        <TextareaItem
          key={name}
          title={name}
          placeholder={
            typeof selectAction.params[name] === 'string'
              ? selectAction.params[name]
              : JSON.stringify(selectAction.params[name])
          }
          error={getFieldError(`actionData.${name}`)}
          onErrorClick={() => {
            Toast.fail(getFieldError(`actionData.${name}`).join(','));
          }}
          autoHeight
        />,
      );
    });
  }

  const tableMenu = abiObj.tables.map(t => ({ value: t.name, label: t.name }));

  const selectTable = abiObj.tables.find(t => t.name === getFieldValue('tableName'));
  let keyList;
  if (selectTable) {
    if (typeof selectTable.key === 'string') {
      keyList = [
        getFieldDecorator(`keys`, {
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                const err = validAbiData(value, selectTable.key);
                cb(err ? [err] : []);
              },
            },
          ],
        })(
          <TextareaItem
            title="key"
            placeholder={selectTable.key}
            autoHeight
            error={getFieldError('keys')}
            onErrorClick={() => {
              Toast.fail(getFieldError('keys').join(','));
            }}
          />,
        ),
      ];
    } else {
      keyList = Object.keys(selectTable.key).map(k => {
        return getFieldDecorator(`keys.${k}`, {
          rules: [
            { required: true },
            {
              validator(_, value, cb) {
                const err = validAbiData(value, selectTable.key[k]);
                cb(err ? [err] : []);
              },
            },
          ],
        })(
          <TextareaItem
            key={k}
            title={k}
            placeholder={selectTable.key[k]}
            autoHeight
            error={getFieldError(`keys.${k}`)}
            onErrorClick={() => {
              Toast.fail(getFieldError(`keys.${k}`).join(','));
            }}
          />,
        );
      });
    }
  }

  return (
    <div className="miniContainer">
      <BaseNavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.push('/')}>
        <FormattedMessage id="interactive" />
      </BaseNavBar>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="caller" />
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
            <FormattedMessage id="contract.address" />
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
            placeholder={formatMessage({ id: 'contract.address' })}
            data={menuData}
            error={getFieldError('to')}
            onErrorClick={() => {
              Toast.fail(getFieldError('to').join(','));
            }}
            onChange={handleToSelect}
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

      {showAbi && (
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
                  const error = validJson(value);
                  cb(error ? [error] : []);
                },
              },
            ],
          })(
            <UploadBtn
              id="abiFile"
              placeholder={formatMessage({ id: 'please.choose.abi.file' })}
              suffixs={['abi', 'json']}
              contentType="text"
              error={getFieldError('abi')}
              onChange={handleAbiSelect}
            >
              <FormattedMessage id="choose.file" />
            </UploadBtn>,
          )}
        </List>
      )}

      <WhiteSpace />
      <SegmentedControl
        values={['Call', 'Query']}
        selectedIndex={['Call', 'Query'].indexOf(action)}
        onValueChange={val => setAction(val)}
      />

      {action === 'Call' && (
        <div>
          <List
            renderHeader={() => (
              <span className={styles.title}>
                {`${formatMessage({ id: 'amount' })} (${formatMessage({
                  id: 'call.contract.with.amount',
                })})`}
              </span>
            )}
          >
            {getFieldDecorator('amount', {
              rules: [
                {
                  validator(_, value, cb) {
                    const error = validAmount(value, 0, balance);
                    cb(error ? [error] : []);
                  },
                },
              ],
            })(
              <InputItem
                extra="FRA"
                placeholder={`${formatMessage({ id: 'available.balance' })}: ${balance}`}
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
                <FormattedMessage id="contract.action" />
              </span>
            )}
          >
            {getFieldDecorator('actionName', { rules: [{ required: true }] })(
              <SelectInput
                editable={false}
                placeholder={formatMessage({ id: 'contract.action' })}
                data={actionMenu}
                error={getFieldError('actionName')}
                onErrorClick={() => {
                  Toast.fail(getFieldError('actionName').join(','));
                }}
              />,
            )}
          </List>

          {!isEmpty(paramList) && (
            <List
              renderHeader={() => (
                <span className={styles.title}>
                  <FormattedMessage id="action.params" />
                </span>
              )}
            >
              {paramList}
            </List>
          )}

          <div className={styles.listTitle}>Gas</div>
          {!isAdvance && (
            <WingBlank className={styles.gasSlider}>
              {getFieldDecorator('gas', {
                initialValue: 6000000,
              })(<Slider min={4000000} max={10000000} />)}
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
              })(<InputItem clear placeholder="GasPrice" extra="FRA" />)}
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
              validateFields((error, value) => {
                if (error) {
                  Toast.fail('Invalid input');
                } else {
                  setShowPopup(!showPopup);
                }
              });
            }}
          >
            <FormattedMessage id="next.step" />
          </Button>
        </div>
      )}

      {action === 'Query' && (
        <div>
          <List
            renderHeader={() => (
              <span className={styles.title}>
                <FormattedMessage id="contract.table" />
              </span>
            )}
          >
            {getFieldDecorator('tableName', { rules: [{ required: true }] })(
              <SelectInput
                editable={false}
                placeholder={formatMessage({ id: 'contract.table' })}
                data={tableMenu}
                error={getFieldError('tableName')}
                onErrorClick={() => {
                  Toast.fail(getFieldError('tableName').join(','));
                }}
              />,
            )}
          </List>
          {!isEmpty(keyList) && (
            <List
              renderHeader={() => (
                <span className={styles.title}>
                  <FormattedMessage id="contract.table.key" />
                </span>
              )}
            >
              {keyList}
            </List>
          )}
          {queryResult && (
            <List
              renderHeader={() => (
                <span className={styles.title}>
                  <FormattedMessage id="contract.query.result" />
                </span>
              )}
            >
              <TextareaItem value={JSON.stringify(queryResult)} autoHeight />
            </List>
          )}
          <WhiteSpace size="xl" />
          <Button
            type="primary"
            onClick={() => {
              handleQuery();
            }}
          >
            <FormattedMessage id="query" />
          </Button>
        </div>
      )}

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
          amount={getFieldValue('amount')}
          gas={getFieldValue('gas')}
          gasPrice={getFieldValue('gasPrice') || defaultGasPrice}
          onCancel={() => setShowPopup(false)}
          onSubmit={() => {
            setShowPopup(false);
            handleCall();
          }}
        />
      </Modal>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  selectedAddress: pihsiu.accounts.selectedAddress || '0x01',
  myContract: pihsiu.contract.myContract || {},
  favourite: pihsiu.contract.favourite || {},
  balance: toFra(pihsiu.balances.current),
  defaultGasPrice: toFra(pihsiu.preferences.defaultGasPrice),
}))(createForm()(Interact));
