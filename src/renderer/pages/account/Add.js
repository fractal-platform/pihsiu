import {
  Button,
  Icon,
  InputItem,
  List,
  NavBar,
  TextareaItem,
  Toast,
  WhiteSpace,
} from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from './Add.css';

function AddAccount(props) {
  const {
    dispatch,
    identities,
    form: { getFieldDecorator, validateFields, getFieldError },
  } = props;

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input.');
      } else {
        dispatch({
          type: 'pihsiu/addAccount',
          payload: value,
        });
      }
    });
  };

  const validateName = (_, value, callback) => {
    if (
      Object.values(identities)
        .map(x => x.name)
        .includes(value)
    ) {
      callback('Another account has used this name!');
    } else {
      callback();
    }
  };

  let index = Object.keys(identities).length + 1;
  let accountName = 'Account ' + index;
  while (
    Object.values(identities)
      .map(x => x.name)
      .includes(accountName)
    ) {
    index++;
    accountName = 'Account ' + index;
  }

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="add.account" defaultMessage="Add Account" />
      </NavBar>

      <WhiteSpace />

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="nickname" defaultMessage="Nickname" />
          </span>
        )}
      >
        {getFieldDecorator('name', {
          initialValue: accountName,
          rules: [{ required: true }, { validator: validateName }],
        })(
          <InputItem
            clear
            placeholder={formatMessage({ id: 'nickname' })}
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
            <FormattedMessage id="private.key" defaultMessage="Private Key" />
            {' ('}
            <FormattedMessage id="optional" defaultMessage="Optional" />
            {')'}
          </span>
        )}
      >
        {getFieldDecorator('privateKey')(
          <TextareaItem
            clear
            rows={5}
            placeholder={formatMessage({ id: 'private.key.description' })}
            error={getFieldError('privateKey')}
            onErrorClick={() => {
              Toast.fail(getFieldError('privateKey').join(','));
            }}
          />,
        )}
      </List>

      <WhiteSpace size="xl" />

      <Button type="primary" onClick={submit}>
        <FormattedMessage id="submit" defaultMessage="Submit" />
      </Button>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  identities: pihsiu.accounts.identities || {},
}))(createForm()(AddAccount));
