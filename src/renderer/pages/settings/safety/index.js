import { List, Button, Icon, NavBar, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { createForm } from 'rc-form';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from '../general/index.css';

function General(props) {
  const { dispatch } = props;

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left"/>} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="safety" defaultMessage="Safety"/>
      </NavBar>

      <WhiteSpace/>

      <List
        renderHeader={() => (
          <span className={styles.title}>
            <FormattedMessage id="show.seedWords" defaultMessage="Show Seed Words"/>
          </span>
        )}
      >
        <Button
          type="ghost"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            dispatch({
              type: 'pihsiu/fetchSeedWords',
            });
            router.push('/seed/Show');
          }}
        >
          <FormattedMessage id="show.seedWords" defaultMessage="Show Seed Words"/>
        </Button>
      </List>
    </div>
  );
}

export default connect()(createForm()(General));
