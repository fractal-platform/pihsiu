import { Button, Flex, List, TextareaItem, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import styles from '../seed/Restore.css';


function TestPage({ dispatch, form: { getFieldProps, validateFields }, test }) {
  const submit = () => {
    validateFields((error, value) => {
      if (error) {
        alert(error);
      }
      dispatch({
        type: 'test/sendAction',
        payload: {
          action: JSON.parse(value.action),
        },
      });
    });
  };

  return (
    <div className={styles.container}>
      <Flex direction="column" alignContent="center">
        <h2 className={styles.title}>Test Page</h2>
        <WingBlank>
          <span className={styles.description}>
            可以向background发送一个action，用来快速调试background接口。
          </span>
        </WingBlank>
      </Flex>
      <WhiteSpace size="xl" />
      <List renderHeader={() => <span className={styles.subtitle}>Action</span>}>
        <TextareaItem rows={6} {...getFieldProps('action')} />
      </List>
      <List renderHeader={() => <span className={styles.subtitle}>Response</span>}>
        <TextareaItem rows={6} value={test.result} />
      </List>

      <WhiteSpace size="xl" />
      <Button type="primary" onClick={submit}>
        确认
      </Button>
    </div>
  );
}

export default connect(({ test }) => ({ test }))(createForm()(TestPage));
