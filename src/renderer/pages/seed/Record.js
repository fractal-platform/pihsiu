import AntdIcon from '@ant-design/icons-react';
import { Button, Flex, NavBar, WhiteSpace, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from './Restore.css';

function Record(props) {
  const { seedWords, dispatch } = props;
  if (!seedWords) {
    dispatch({
      type: 'pihsiu/fetchSeedWords',
    });
  }
  const words = seedWords || [
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
    'xxxxx',
  ];

  return (
    <div className={styles.container}>
      <NavBar mode="light">
        <FormattedMessage id="record" />
      </NavBar>

      <Flex direction="column" alignContent="center">
        <WhiteSpace size="xl" />
        <WingBlank>
          <span className={styles.description}>
            <FormattedMessage id="seedwords.description" />
          </span>
        </WingBlank>
        <WhiteSpace />
        <WingBlank>
          <span className={styles.warning}>
            <AntdIcon type="alert-o" />
            <FormattedMessage id="seedwords.warning" />
          </span>
        </WingBlank>
      </Flex>
      <WhiteSpace size="xl" />
      <WingBlank>
        <Flex>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[0]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[1]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[2]}
          </Button>
        </Flex>
        <WhiteSpace />
        <Flex>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[3]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[4]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[5]}
          </Button>
        </Flex>
        <WhiteSpace />
        <Flex>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[6]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[7]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[8]}
          </Button>
        </Flex>
        <WhiteSpace />
        <Flex>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[9]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[10]}
          </Button>
          <Button size="small" style={{ flex: 1, marginRight: '5px' }}>
            {words[11]}
          </Button>
        </Flex>
      </WingBlank>

      <WhiteSpace size="xl" />
      <Button
        type="primary"
        onClick={() => {
          router.push('/seed/confirm');
        }}
      >
        <FormattedMessage id="next.step" />
      </Button>
    </div>
  );
}

export default connect(({ pihsiu }) => ({ seedWords: pihsiu.seedWords }))(Record);
