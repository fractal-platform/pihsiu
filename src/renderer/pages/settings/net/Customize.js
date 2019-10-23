import { Badge, Button, Icon, InputItem, List, NavBar, Toast, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import log from 'loglevel';
import { createForm } from 'rc-form';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import { netColor } from '../../../../core/Enums';
import SelectInput from '../../../components/SelectInput';
import styles from './Customize.css';

function CustomForm(props) {
  const {
    selected,
    dispatch,
    providers,
    current,
    form: { getFieldDecorator, getFieldValue, validateFields, getFieldError },
  } = props;

  const validateRpc = (_, value, callback) => {
    const { rpcUrl } = selected;
    if (value !== rpcUrl && providers.map(x => x.rpcUrl).indexOf(value) !== -1) {
      callback('Another network has used this rpcUrl!');
    } else {
      callback();
    }
  };

  const handleDelete = () => {
    if (current.rpcUrl === selected.rpcUrl) {
      Toast.fail('Cannot delete the current using network!');
      return;
    }
    dispatch({
      type: 'pihsiu/deleteNetwork',
      payload: [selected.rpcUrl],
    }).then(resp => {
      if (resp.error) {
        log.error(resp.error);
        Toast.fail('update network info failed');
      } else {
        router.goBack();
      }
    });
  };

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input.');
      } else {
        dispatch({
          type: 'pihsiu/updateNetwork',
          payload: { provider: value, rpcUrl: selected.rpcUrl },
        }).then(resp => {
          if (resp.error) {
            log.error(resp.error);
            Toast.fail('update network info failed');
          } else {
            router.goBack();
          }
        });
        dispatch({
          type: 'global/setConnected',
          payload: 'loading',
        });
      }
    });
  };

  const menuData = Object.keys(netColor).map(key => ({
    value: netColor[key],
    label: (
      <span>
        <Badge dot style={{ background: netColor[key], marginRight: 8 }} />
        {netColor[key]}
      </span>
    ),
  }));

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="customize.network" defaultMessage="Customize Network" />
      </NavBar>

      <WhiteSpace />

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="name" defaultMessage="Name" />
          </span>
        )}
      >
        {getFieldDecorator('displayName', {
          initialValue: selected.displayName,
          rules: [{ required: true }],
        })(
          <InputItem
            editable={true}
            placeholder={formatMessage({ id: 'network.name' })}
            error={getFieldError('displayName')}
            onErrorClick={() => {
              Toast.fail(getFieldError('displayName').join(','));
            }}
          />,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="label.color" defaultMessage="Label Color" />
          </span>
        )}
      >
        {getFieldDecorator('color', {
          initialValue: selected.color || '#78A355',
          rules: [{ required: true }],
        })(
          <SelectInput clear placeholder="Label Color show on NavBar" data={menuData}>
            <Badge dot size="large" style={{ background: getFieldValue('color') || '#ddd' }} />
          </SelectInput>,
        )}
      </List>

      <List renderHeader={() => <span className={styles.title}>URL</span>}>
        {getFieldDecorator('rpcUrl', {
          initialValue: selected.rpcUrl,
          rules: [{ required: true }, { validator: validateRpc }, { type: 'url' }],
        })(
          <InputItem
            clear
            placeholder="eg: http://localhost:8545/rpc"
            error={getFieldError('rpcUrl')}
            onErrorClick={() => {
              Toast.fail(getFieldError('rpcUrl').join(','));
            }}
          />,
        )}
      </List>

      {/* todo fail to add integer rule*/}
      <List renderHeader={() => <span className={styles.title}>Chain ID</span>}>
        {getFieldDecorator('chainId', {
          initialValue: selected.chainId,
          rules: [{ required: true }],
        })(
          <InputItem
            clear
            placeholder="chainId"
            error={getFieldError('chainId')}
            onErrorClick={() => {
              Toast.fail(getFieldError('chainId').join(','));
            }}
          />,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="scan.url" defaultMessage="Scan URL" />
          </span>
        )}
      >
        {getFieldDecorator('scanUrl', {
          initialValue: selected.scanUrl,
          rules: [{ type: 'url' }],
        })(<InputItem clear placeholder={formatMessage({ id: 'scan.url.description' })} />)}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="faucet.url" defaultMessage="Faucet URL" />
          </span>
        )}
      >
        {getFieldDecorator('faucetUrl', {
          initialValue: selected.faucetUrl,
          rules: [{ type: 'url' }],
        })(<InputItem clear placeholder={formatMessage({ id: 'faucet.url.description' })} />)}
      </List>

      <WhiteSpace size="xl" />

      <Button type="primary" onClick={submit}>
        <FormattedMessage id="submit" defaultMessage="Submit" />
      </Button>

      <WhiteSpace size="xl"/>

      <Button type="warning" onClick={handleDelete}>
        <FormattedMessage id="delete" defaultMessage="Delete"/>
      </Button>
    </div>
  );
}

export default connect(({ net, pihsiu }) => ({
  providers: pihsiu.network.providers || [],
  current: pihsiu.network.current,
  selected: net.selected,
}))(createForm()(CustomForm));
