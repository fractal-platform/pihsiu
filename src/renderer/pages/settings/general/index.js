import { Button, Icon, List, NavBar, Picker, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { FormattedMessage, setLocale } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from './index.css';

function General(props) {
  const {
    preferences = {},
    dispatch,
    form: { getFieldDecorator, getFieldValue },
  } = props;

  const menuData = [
    { value: 'en-US', label: <span>English</span> },
    { value: 'zh-CN', label: <span>中文简体</span> },
  ];

  const languageIcons = {
    'zh-CN': '🇨🇳',
    'en-US': '🇬🇧',
  };

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="general" defaultMessage="General" />
      </NavBar>

      <WhiteSpace />

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="language" defaultMessage="Language" />
          </span>
        )}
      >
        {getFieldDecorator('language', {
          initialValue: [preferences.locale],
        })(
          <Picker
            data={menuData}
            cols={1}
            onOk={() => {
              const lang = getFieldValue('language', false);
              dispatch({ type: 'pihsiu/setLocale', payload: lang[0] });
              setLocale(lang[0]);
            }}
          >
            <List.Item arrow="horizontal">{languageIcons[getFieldValue('language')]}</List.Item>
          </Picker>,
        )}
      </List>

      <WhiteSpace/>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="wipe.transaction" defaultMessage="Wipe Transaction"/>
          </span>
        )}
      >
        <Button
          type="ghost"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            dispatch({
              type: 'pihsiu/wipeTx',
            });
          }}
        >
          <FormattedMessage id="wipe.transaction" defaultMessage="Wipe Transaction"/>
        </Button>
      </List>
    </div>
  );
}

export default connect(({ pihsiu: { preferences } }) => ({ preferences }))(createForm()(General));
