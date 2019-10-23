import { Icon, List, NavBar, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';

const Item = List.Item;

function IdentityList(props) {
  const { identities, dispatch } = props;

  const items = Object.keys(identities).map(i => {
    const p = identities[i];
    return (
      <Item
        key={i}
        arrow="horizontal"
        onClick={() => {
          dispatch({
            type: 'identity/setSelected',
            payload: p,
          });
          router.push('/settings/identity/customize');
        }}
      >
        <span style={{ fontSize: 15, color: 'var(--title-font-color)' }}>{p.name}</span>
      </Item>
    );
  });

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left"/>} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="identities" defaultMessage="Identities"/>
      </NavBar>

      <WhiteSpace/>

      <List>{items}</List>
    </div>
  );
}

export default connect(({ pihsiu }) => ({ identities: pihsiu.accounts.identities || {} }))(
  IdentityList,
);
