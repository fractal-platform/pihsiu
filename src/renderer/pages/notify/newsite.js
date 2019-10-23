import { Badge, Button, Flex, NavBar, WingBlank } from 'antd-mobile';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import earthImg from '../../assets/earth.png';
import logoSvg from '../../assets/logo.svg';
import checkImg from '../../assets/success.png';
import styles from './newsite.css';

function Record(props) {
  const {
    dispatch,
    candidates,
    currentNet,
    location: {
      query: { origin },
    },
  } = props;

  const netStatus = (
    <div>
      <Badge dot style={{ color: currentNet.color }} /> {currentNet.displayName}
    </div>
  );
  const handlePass = () => {
    dispatch({
      type: 'pihsiu/passDomain',
      payload: { origin },
    });
  };

  const handleReject = () => {
    dispatch({
      type: 'pihsiu/rejectDomain',
      payload: { origin },
    });
  };

  const siteMeta = candidates[origin];
  let statusImg = siteMeta && siteMeta.icon ? siteMeta.icon : earthImg;

  return (
    <div className="miniContainer">
      <NavBar mode="light" rightContent={netStatus}>
        <FormattedMessage id="connect.request" />
      </NavBar>

      <div className={styles.approveBox}>
        <Flex direction="column" align="center" style={{ flex: 1 }}>
          <img alt="xxx" src={statusImg} className={styles.approveImg} />
          <h1>{origin}</h1>
        </Flex>
        <img src={checkImg} alt="" className={styles.approveCheck} />
        <Flex direction="column" align="center" style={{ flex: 1 }}>
          <img alt="logo" src={logoSvg} className={styles.approveImg} />
          <h1>
            <FormattedMessage id="pihsiu" />
          </h1>
        </Flex>
      </div>

      <WingBlank className={styles.approveContent}>
        <h1>{siteMeta ? siteMeta.name : ''}</h1>
        <h1>
          <FormattedMessage id="would.like.to.connect" />
        </h1>
        <p>
          This site is requesting access to view your current account address. Always make sure you
          trust the sites you interact with.
        </p>
      </WingBlank>

      <div className={styles.btnGroup}>
        <WingBlank>
          <Flex>
            <Flex.Item>
              <Button type="ghost" onClick={handleReject}>
                <FormattedMessage id="reject" />
              </Button>
            </Flex.Item>
            <Flex.Item>
              <Button type="primary" onClick={handlePass}>
                <FormattedMessage id="connect" />
              </Button>
            </Flex.Item>
          </Flex>
        </WingBlank>
      </div>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  candidates: pihsiu.auth.candidates || {},
  currentNet: pihsiu.network.current || {},
}))(Record);
