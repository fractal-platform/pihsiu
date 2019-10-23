import {
  Button,
  Flex,
  Icon,
  List,
  NavBar,
  TextareaItem,
  Toast,
  WhiteSpace,
  WingBlank,
} from 'antd-mobile';
import log from 'loglevel';
import { connect } from 'dva';
import { useState } from 'react';
import router from 'umi/router';
import styles from './Restore.css';

function Confirm(props) {
  const { dispatch, seedWords, confirmWords } = props;
  let initWords = [];
  const initDisables = [];
  for (let i = 0; i < 12; i++) {
    initWords.push('xxxxx');
    initDisables.push(false);
  }

  const words = confirmWords || initWords;
  const [disables, setDisables] = useState(initDisables);
  const [wordStr, setWordStr] = useState(' ');

  const handleWordClick = n => {
    if (!disables[n]) {
      setWordStr(`${wordStr} ${words[n]}`);
      disables[n] = true;
      setDisables(disables);
    } else {
      setWordStr(wordStr.replace(` ${words[n]}`, ''));
      disables[n] = false;
      setDisables(disables);
    }
  };

  //这里既需要
  const genBtns = range => {
    return range.map(n => {
      let style = { flex: 1, marginRight: '5px' };
      if (disables[n]) {
        style = Object.assign(style, {
          color: 'rgba(0, 0, 0, 0.3)',
          opacity: 0.6,
        });
      }
      return (
        <Button
          size="small"
          style={style}
          key={n}
          onClick={() => {
            handleWordClick(n);
          }}
        >
          {words[n]}
        </Button>
      );
    });
  };

  const handleConfirm = () => {
    if (wordStr.trim() === seedWords.join(' ').trim()) {
      dispatch({
        type: 'pihsiu/saveSeedWords',
      }).then(resp => {
        if (resp.error) {
          log.error(resp.error);
          Toast.fail('update network info failed');
        } else {
          router.push('/');
        }
      });
    } else {
      Toast.fail('Wrong order, please try again!');
      setDisables(initDisables);
      setWordStr('');
    }
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
        <h2 className={styles.title}>Confirm</h2>
        <WingBlank>
          <span className={styles.description}>
            To ensure you have backed up your seed phrase, please select your 12 seed words in
            order.
          </span>
        </WingBlank>
      </Flex>
      <WhiteSpace size="xl" />
      <List renderHeader={() => <span className={styles.subtitle}>Seed words</span>}>
        <TextareaItem rows={5} value={wordStr} />
      </List>
      <WhiteSpace size="xl" />
      <WingBlank>
        <Flex>{genBtns([0, 1, 2])}</Flex>
        <WhiteSpace />
        <Flex>{genBtns([3, 4, 5])}</Flex>
        <WhiteSpace />
        <Flex>{genBtns([6, 7, 8])}</Flex>
        <WhiteSpace />
        <Flex>{genBtns([9, 10, 11])}</Flex>
      </WingBlank>

      <WhiteSpace size="xl" />
      <Button type="primary" onClick={handleConfirm}>
        确认
      </Button>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  seedWords: pihsiu.seedWords,
  confirmWords: pihsiu.confirmWords,
}))(Confirm);
