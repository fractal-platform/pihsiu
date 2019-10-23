import { Button, Icon, InputItem, List, NavBar, Toast, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import UploadBtn from '../../components/UploadBtn';
import { validAddress, validJson } from '../../utils';
import styles from './index.css';

function Add(props) {
  const {
    form: { getFieldDecorator, getFieldError, validateFields },
    dispatch,
    name,
    contractAddress,
    edit,
  } = props;

  const onSubmit = () => {
    validateFields((error, value) => {
      if (error) {
        Toast.fail('Invalid Input');
      } else {
        dispatch({
          type: 'pihsiu/addOrUpdateFavourite',
          payload: value,
        });
      }
    });
  };

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.push('/')}>
        <FormattedMessage id={edit ? 'edit.favourite' : 'add.favourite'}/>
      </NavBar>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="name" />
          </span>
        )}
      >
        {getFieldDecorator('name', { initialValue: name, rules: [{ required: true }] })(
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
            <FormattedMessage id="contract.address" />
          </span>
        )}
      >
        {getFieldDecorator('contractAddress', {
          initialValue: contractAddress,
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
          <InputItem
            clear
            placeholder={formatMessage({ id: 'contract.address' })}
            error={getFieldError('contractAddress')}
            onErrorClick={() => {
              Toast.fail(getFieldError('contractAddress').join(','));
            }}
            editable={!contractAddress}
          />,
        )}
      </List>
      {!contractAddress && (
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
            >
              <FormattedMessage id="choose.file" />
            </UploadBtn>,
          )}
        </List>
      )}

      <WhiteSpace size="xl" />

      <Button type="primary" onClick={onSubmit}>
        <FormattedMessage id={edit ? 'edit' : 'add'} />
      </Button>
    </div>
  );
}

export default connect(({ manageContract }) => ({ ...manageContract }))(createForm()(Add));
