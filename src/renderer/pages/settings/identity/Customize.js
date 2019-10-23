import { Button, Icon, InputItem, List, NavBar, Toast, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from './Customize.css';

function CustomForm(props) {
  const {
    selected,
    dispatch,
    identities,
    form: { getFieldDecorator, validateFields, getFieldError },
  } = props;

  const validateName = (_, value, callback) => {
    const { name } = selected;
    if (value === name) {
      callback('No modification has made');
    } else if (
      Object.values(identities)
        .map(x => x.name)
        .include(value)
    ) {
      callback('Another account has used this name!');
    } else {
      callback();
    }
  };

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input.');
      } else {
        dispatch({
          type: 'pihsiu/setAccount',
          payload: value,
        });
        router.goBack();
      }
    });
  };

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left"/>} onLeftClick={router.goBack}>
        <FormattedMessage id="customize.network" defaultMessage="Customize Network"/>
      </NavBar>

      <WhiteSpace/>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="name" defaultMessage="Name"/>
          </span>
        )}
      >
        {getFieldDecorator('name', {
          initialValue: selected.name,
          rules: [{ required: true }, { validator: validateName }],
        })(
          <InputItem
            placeholder={formatMessage({ id: 'network.name' })}
            error={getFieldError('name')}
            onErrorClick={() => {
              Toast.fail(getFieldError('name').join(','));
            }}
          />,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.title}>{formatMessage({ id: 'account' })}</span>
        )}
      >
        {getFieldDecorator('address', {
          initialValue: selected.address,
          rules: [{ required: true }],
        })(
          <InputItem
            disabled
            clear
            placeholder="eg: http://localhost:8545/rpc"
            error={getFieldError('address')}
            onErrorClick={() => {
              Toast.fail(getFieldError('address').join(','));
            }}
          />,
        )}
      </List>

      <WhiteSpace size="xl"/>

      <Button type="primary" onClick={submit}>
        <FormattedMessage id="submit" defaultMessage="Submit"/>
      </Button>
    </div>
  );
}

export default connect(({ pihsiu, identity }) => ({
  identities: pihsiu.accounts.identities || {},
  selected: identity.selected,
}))(createForm()(CustomForm));
