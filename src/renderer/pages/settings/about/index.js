/* eslint-disable jsx-a11y/anchor-is-valid */
import { Flex, Icon, NavBar, WhiteSpace, WingBlank } from 'antd-mobile';
import classNames from 'classnames';
import { connect } from 'dva';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import pkg from '../../../../../package.json';
import logo from '../../../assets/logo.svg';
import styles from './index.css';

function About(props) {
  const { dispatch } = props;

  const link = url => {
    dispatch({
      type: 'pihsiu/openWindow',
      payload: { url },
    });
  };

  return (
    <div className="miniContainer">
      <NavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.goBack()}>
        <FormattedMessage id="about" />
      </NavBar>
      <WhiteSpace size="xl" />
      <WingBlank size="lg">
        <Flex direction="column" justify="center" align="center">
          <img className={styles.logo} src={logo} alt="" />
          <WhiteSpace size="xl" />
          <div className={styles.infoTab}>
            <div className={styles.infoTabHeader}>
              <FormattedMessage id="pihsiu" />
            </div>
            <div className={styles.infoTabContent}>{`version ${pkg.version}`}</div>
          </div>

          <div className={styles.infoTab}>
            <div className={styles.design}>
              <FormattedMessage id="about.design" />
            </div>
          </div>
        </Flex>

        <Flex direction="column" justify="start" align="start">
          <div className={styles.infoLinkHeader}>Links</div>

          <div className={styles.infoLink}>
            <a
              onClick={() => {
                link('https://github.com/fractal-platform/pihsiu/wiki/Private-policy');
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoLinkText}>
                <FormattedMessage id="private.policy" />
              </span>
            </a>
          </div>

          <div className={styles.infoLink}>
            <a
              onClick={() => {
                link('https://github.com/fractal-platform/pihsiu/wiki/Terms-of-use');
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoLinkText}>
                <FormattedMessage id="terms.of.use" />
              </span>
            </a>
          </div>

          <div className={styles.infoLink}>
            <a
              onClick={() => {
                link('https://github.com/fractal-platform/pihsiu/wiki/Open-source-Software');
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoLinkText}>
                <FormattedMessage id="open.source.software" />
              </span>
            </a>
          </div>

          <hr className={classNames(styles.divider, 'divider')} />

          <div className={styles.infoLink}>
            <a
              onClick={() => {
                link('https://github.com/fractal-platform/pihsiu');
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoLinkText}>
                <FormattedMessage id="visit.our.website" />
              </span>
            </a>
          </div>

          <div className={styles.infoLink}>
            <a
              onClick={() => {
                link('https://github.com/fractal-platform/pihsiu/issues');
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoLinkText}>
                <FormattedMessage id="contact.us" />
              </span>
            </a>
          </div>
        </Flex>
      </WingBlank>
    </div>
  );
}

export default connect()(About);
