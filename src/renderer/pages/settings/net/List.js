import AntdIcon from '@ant-design/icons-react';
import { Badge, Icon, List, NavBar, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';

const Item = List.Item;

function NetList(props) {
  const { providers, dispatch } = props;

  const items = providers.map((p, i) => (
    <Item
      key={i}
      arrow="horizontal"
      onClick={() => {
        dispatch({
          type: 'net/setSelected',
          payload: p,
        });
        router.push('/settings/net/customize');
      }}
    >
      <Badge dot size="large" style={{ marginRight: 15, backgroundColor: p.color }} />
      <span style={{ fontSize: 15, color: 'var(--title-font-color)' }}>{p.displayName}</span>
    </Item>
  ));

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="networks" defaultMessage="Networks" />
      </NavBar>

      <WhiteSpace />

      <List>
        {items}
        <Item
          key={-1}
          arrow="horizontal"
          onClick={() => {
            dispatch({
              type: 'pihsiu/openWindow',
              payload: {
                url: 'https://github.com/fractal-platform/pihsiu/wiki/Known-List-of-test-nodes',
              },
            });
          }}
        >
          <AntdIcon type="cloud-download-o" style={{ marginRight: 15, marginBottom: -3 }} />
          <span style={{ fontSize: 15, color: 'var(--title-font-color)' }}>
            <FormattedMessage id="settings.net.list.get" />
          </span>
        </Item>
        <Item
          key={-2}
          arrow="horizontal"
          onClick={() => {
            dispatch({
              type: 'net/setSelected',
              payload: {},
            });
            router.push('/settings/net/customize');
          }}
        >
          <AntdIcon type="plus-circle-o" style={{ marginRight: 15, marginBottom: -3 }} />
          <span style={{ fontSize: 15, color: 'var(--title-font-color)' }}>
            <FormattedMessage id="settings.net.list.add" />
          </span>
        </Item>
      </List>
    </div>
  );
}

export default connect(({ pihsiu }) => ({ providers: pihsiu.network.providers || [] }))(NetList);
