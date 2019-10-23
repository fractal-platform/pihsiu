import AntdIcon from '@ant-design/icons-react';
import { Button, Flex, Icon, List, WhiteSpace } from 'antd-mobile';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import BaseNavBar from '../../components/BaseNavBar';
import styles from './index.css';

const Item = List.Item;
const Brief = Item.Brief;

function Manage(props) {
  const { favourite, dispatch, scanUrl } = props;

  const handleShare = contractAddress => {
    dispatch({
      type: 'pihsiu/openContractInfoWindow',
      payload: {
        contractAddress,
        scanUrl,
      },
    });
  };
  const handleEdit = contractAddress => {
    dispatch({
      type: 'manageContract/update',
      payload: { contractAddress, name: favourite[contractAddress].name, edit: true },
    });
    router.push('/contract/add');
  };
  const handleDelete = contractAddress => {
    dispatch({
      type: 'pihsiu/deleteFromFavourite',
      payload: { contractAddress },
    });
  };
  const handleAdd = () => {
    dispatch({
      type: 'manageContract/clear',
    });
    router.push('/contract/add');
  };

  return (
    <div className="miniContainer">
      <BaseNavBar mode="light" icon={<Icon type="left" />} onLeftClick={() => router.push('/')}>
        <FormattedMessage id="manage.favourite"/>
      </BaseNavBar>

      <WhiteSpace />

      <List className="my-list">
        {!isEmpty(favourite) &&
          Object.keys(favourite).map(contractAddress => (
            <Item
              extra={
                <Flex className={styles.extraGroup}>
                  <Flex.Item className={styles.extraBtn} style={{ background: '#009ad6' }}>
                    <AntdIcon type="share-alt-o" onClick={() => handleShare(contractAddress)} />
                  </Flex.Item>
                  <Flex.Item className={styles.extraBtn} style={{ background: '#45b97c' }}>
                    <AntdIcon type="edit-o" onClick={() => handleEdit(contractAddress)} />
                  </Flex.Item>
                  <Flex.Item className={styles.extraBtn} style={{ background: '#dea32c' }}>
                    <AntdIcon type="delete-o" onClick={() => handleDelete(contractAddress)} />
                  </Flex.Item>
                </Flex>
              }
            >
              {favourite[contractAddress].name}
              <Brief>{contractAddress}</Brief>
            </Item>
          ))}
      </List>

      <WhiteSpace />

      <Button type="ghost" icon={<AntdIcon type="plus-o" />} onClick={handleAdd}>
        <FormattedMessage id="add.favourite"/>
      </Button>
    </div>
  );
}

export default connect(({ pihsiu }) => ({
  favourite: pihsiu.contract.favourite || {},
  scanUrl: pihsiu.network.current.scanUrl || '',
}))(Manage);
