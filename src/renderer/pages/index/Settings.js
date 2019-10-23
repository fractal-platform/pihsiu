import { List, WhiteSpace } from 'antd-mobile';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import BaseNavBar from '../../components/BaseNavBar';

const Item = List.Item;
const Brief = Item.Brief;

function Settings(props) {
  return (
    <div>
      <BaseNavBar mode="light" />

      <WhiteSpace />

      <List className="my-list">
        <Item
          arrow="horizontal"
          multipleLine
          onClick={() => {
            router.push('/settings/general');
          }}
        >
          <FormattedMessage id="general" />{' '}
          <Brief>
            <FormattedMessage id="general.description" />
          </Brief>
        </Item>
        <Item
          arrow="horizontal"
          multipleLine
          onClick={() => {
            router.push('/settings/safety');
          }}
        >
          <FormattedMessage id="security.privacy" />
          <Brief>
            <FormattedMessage id="security.privacy.description" />
          </Brief>
        </Item>
        <Item
          arrow="horizontal"
          multipleLine
          onClick={() => {
            router.push('/settings/net/list');
          }}
        >
          <FormattedMessage id="network" />
          <Brief>
            <FormattedMessage id="network.description" />
          </Brief>
        </Item>

        <Item
          arrow="horizontal"
          multipleLine
          onClick={() => {
            router.push('/settings/identity/list');
          }}
        >
          <FormattedMessage id="identities"/>
          <Brief>
            <FormattedMessage id="identities.description"/>
          </Brief>
        </Item>

        <Item
          arrow="horizontal"
          multipleLine
          onClick={() => {
            router.push('/settings/about');
          }}
        >
          <FormattedMessage id="about" />
          <Brief>
            <FormattedMessage id="about.description" />
          </Brief>
        </Item>
      </List>
    </div>
  );
}

export default Settings;
