import {
  Button,
  Flex,
  Icon,
  InputItem,
  List,
  NavBar,
  TextareaItem,
  Toast,
  WhiteSpace,
  WingBlank,
  ActivityIndicator,
} from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import router from 'umi/router';
import styles from './Restore.css';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { useState } from 'react';

function Restore(props) {
  const {
    dispatch,
    form: { getFieldDecorator, getFieldValue, getFieldError, validateFields },
  } = props;

  const [animating, setAnimating] = useState(false);

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
        Toast.fail('Invalid Input.');
      } else {
        setAnimating(true);
        dispatch({
          type: 'pihsiu/restore',
          payload: {
            password: value.password,
            seedWords: value.seedWords,
          },
        }).then(resp => {
          setAnimating(false);
          if (resp.error) {
            Toast.fail(resp.error);
          } else {
            router.push('/');
          }
        });
      }
    });
  };

  return (
    <div className={styles.container}>
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => {
          router.goBack();
        }}
      />

      <Flex direction="column" alignContent="center">
        <h2 className={styles.title}>
          <FormattedMessage id="restore.account"/>
        </h2>
        <WingBlank>
          <span className={styles.description}>
            <FormattedMessage id="restore.account.description"/>
          </span>
        </WingBlank>
      </Flex>
      <WhiteSpace />
      <List
        renderHeader={() => (
          <span className={styles.subtitle}>
            <FormattedMessage id="seedWords"/>
          </span>
        )}
      >
        {getFieldDecorator('seedWords', {
          rules: [{ required: true }],
        })(
          <TextareaItem
            rows={5}
            placeholder={formatMessage({ id: 'separate.each.word.with.a.single.space' })}
            error={getFieldError('seedWords')}
            onErrorClick={() => {
              Toast.fail(getFieldError('seedWords').join(','));
            }}
          />,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.subtitle}>
            <FormattedMessage id="new.password"/>
          </span>
        )}
      >
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
            placeholder={formatMessage({ id: 'new.password' })}
            error={getFieldError('password')}
            onErrorClick={() => {
              Toast.fail(getFieldError('password').join(','));
            }}
          />,
        )}
      </List>

      <List
        renderHeader={() => (
          <span className={styles.subtitle}>
            <FormattedMessage id="confirm.password"/>
          </span>
        )}
      >
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
      <WhiteSpace size="xl" />
      <Button type="primary" onClick={submit}>
        <FormattedMessage id="confirmed"/>
      </Button>
      <ActivityIndicator
        toast
        size="large"
        text={formatMessage({ id: 'restoring' })}
        animating={animating}
      />
    </div>
  );
}

export default connect()(createForm()(Restore));
