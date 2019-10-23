import { Button, InputItem, List, Toast, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import router from 'umi/router';
import styles from './index.css';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';

function Register(props) {
  const {
    dispatch,
    form: { getFieldDecorator, getFieldValue, getFieldError, validateFields },
  } = props;

  const verifyPassword = (rule, value, callback) => {
    if (!value || value.length < 8) {
      callback('Password must longer than 8');
    } else {
      callback();
    }
  };

  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Password.');
      } else {
        dispatch({
          type: 'pihsiu/createWallet',
          payload: {
            password: value.password,
          },
        });
      }
    });
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles.login}>
        <h1 className={styles.header}>Pihsiu!</h1>
        <div className={styles.description}>
          <div>The fractal blockchain awaits</div>
        </div>
        <WingBlank style={{ marginTop: '25px', width: '80%' }}>
          <List style={{ width: '100%' }}>
            {getFieldDecorator('password', {
              rules: [
                { required: true },
                {
                  validator: verifyPassword,
                },
              ],
            })(
              <InputItem
                type="password"
                placeholder={formatMessage({ id: 'create.password' })}
                error={getFieldError('password')}
                onErrorClick={() => {
                  Toast.fail(getFieldError('password').join(','));
                }}
              />,
            )}
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: 'you should confirm the password.',
                },
                {
                  validator: compareToFirstPassword,
                },
              ],
            })(
              <InputItem
                type="password"
                placeholder={formatMessage({ id: 'confirm.password' })}
                error={getFieldError('confirm')}
                onErrorClick={() => {
                  Toast.fail(getFieldError('confirm').join(','));
                }}
              />,
            )}
          </List>
          <WhiteSpace />
          <Button type="primary" onClick={submit}>
            <FormattedMessage id={'create'}/>
          </Button>
          <WhiteSpace />
          <Button
            type="ghost"
            onClick={() => {
              router.push('/seed/restore');
            }}
          >
            <FormattedMessage id={'restore.from.seed'}/>
          </Button>
        </WingBlank>
      </div>
    </div>
  );
}

export default connect()(createForm()(Register));
