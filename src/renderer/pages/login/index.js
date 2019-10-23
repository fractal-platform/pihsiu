import { Button, InputItem, List, Toast, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import router from 'umi/router';
import styles from './index.css';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';

function Login(props) {
  const {
    dispatch,
    form: { getFieldDecorator, getFieldError, validateFields },
  } = props;

  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Password.');
      } else {
        dispatch({
          type: 'pihsiu/login',
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
        <WingBlank style={{ marginTop: '30px', width: '80%' }}>
          <List style={{ width: '100%' }}>
            {getFieldDecorator('password', {
              rules: [{ required: true }],
            })(
              <InputItem
                type="password"
                placeholder={formatMessage({ id: 'password' })}
                error={getFieldError('password')}
                onErrorClick={() => {
                  Toast.fail(getFieldError('password').join(','));
                }}
              />,
            )}
          </List>
          <WhiteSpace />
          <Button type="primary" onClick={submit}>
            <FormattedMessage id={'login'}/>
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

export default connect()(createForm()(Login));
