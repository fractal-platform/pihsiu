import { AppstoreTwoTone, HomeTwoTone, SettingTwoTone } from '@ant-design/icons';
import AntdIcon from '@ant-design/icons-react';
import { TabBar } from 'antd-mobile';
import { connect } from 'dva';
import React from 'react';
import { formatMessage } from 'umi-plugin-locale';
import Contract from './Contract';
import Home from './Home';
import Settings from './Settings';

function AppIndexPage(props) {
  const {
    dispatch,
    home: { activeTab },
  } = props;

  const handleTabPress = tab => {
    dispatch({
      type: 'home/update',
      payload: { activeTab: tab },
    });
  };

  return (
    <TabBar unselectedTintColor="#949494" tintColor="#4B4185" barTintColor="white">
      <TabBar.Item
        title={formatMessage({ id: 'home' })}
        key="Home"
        icon={<AntdIcon type="home-o" style={{ fontSize: '21px' }} />}
        selectedIcon={
          <AntdIcon
            type={HomeTwoTone}
            primaryColor="@brand-primary"
            secondaryColor="@brand-primary-tap"
            style={{ fontSize: '21px' }}
          />
        }
        selected={activeTab === 'home'}
        onPress={() => {
          handleTabPress('home');
        }}
      >
        <Home />
      </TabBar.Item>
      <TabBar.Item
        icon={<AntdIcon type="appstore-o" style={{ fontSize: '21px' }} />}
        selectedIcon={
          <AntdIcon
            type={AppstoreTwoTone}
            primaryColor="@brand-primary"
            secondaryColor="@brand-primary-tap"
            style={{ fontSize: '21px' }}
          />
        }
        title={formatMessage({ id: 'contract' })}
        key="contract"
        selected={activeTab === 'contract'}
        onPress={() => {
          handleTabPress('contract');
        }}
      >
        <Contract />
      </TabBar.Item>
      <TabBar.Item
        icon={<AntdIcon type="setting-o" style={{ fontSize: '21px' }} />}
        selectedIcon={
          <AntdIcon
            type={SettingTwoTone}
            primaryColor="@brand-primary"
            secondaryColor="@brand-primary-tap"
            style={{ fontSize: '21px' }}
          />
        }
        title={formatMessage({ id: 'settings' })}
        key="Settings"
        selected={activeTab === 'settings'}
        onPress={() => {
          handleTabPress('settings');
        }}
      >
        <Settings />
      </TabBar.Item>
    </TabBar>
  );
}

export default connect(({ home }) => ({ home }))(AppIndexPage);
