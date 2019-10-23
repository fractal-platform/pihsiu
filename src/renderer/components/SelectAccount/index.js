import AntdIcon from '@ant-design/icons-react';
import { Flex, Popover, Tag } from 'antd-mobile';
import { useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { FormattedMessage } from 'umi-plugin-locale';

function SelectAccount(props) {
  const { current, accounts = [], onSelect, keyrings } = props;

  const [showPopover, setShowPopover] = useState(false);

  const isSimpleKeyPair = address => {
    const simpleKeyPairList = keyrings
      .filter(x => x.type === 'Simple Key Pair')
      .map(x => x.accounts[0]);
    return simpleKeyPairList.indexOf(address) !== -1;
  };

  const handleSelect = node => {
    if (onSelect) {
      onSelect(node.props.value);
    }
    setShowPopover(false);
  };

  const overlay = accounts.map((a, i) => (
    <Popover.Item
      key={i}
      value={a.address}
      icon={<Jazzicon diameter={18} seed={jsNumberForAddress(a.address)} />}
    >
      {a.name}
      {isSimpleKeyPair(a.address) && <Tag small>Imported</Tag>}
      {a.address === current && (
        <span style={{ marginLeft: 8, color: '#009ad6' }}>
          <AntdIcon type="check-o" />
        </span>
      )}
    </Popover.Item>
  ));

  overlay.push(
    <Popover.Item key={overlay.length} value="create" icon={<AntdIcon type="plus-circle-o" />}>
      <FormattedMessage id="create.account" defaultMessage="Create Account" />
    </Popover.Item>,
  );
  overlay.push(
    <Popover.Item key={overlay.length} value="export" icon={<AntdIcon type="export-o" />}>
      <FormattedMessage id="export.account" defaultMessage="Export Account" />
    </Popover.Item>,
  );

  return (
    <Popover
      overlayClassName="fortest"
      overlayStyle={{ color: 'currentColor' }}
      visible={showPopover}
      overlay={overlay}
      align={{
        overflow: { adjustY: 0, adjustX: 0 },
        offset: [-10, 0],
      }}
      onVisibleChange={v => setShowPopover(v)}
      onSelect={handleSelect}
    >
      <div
        style={{
          height: '100%',
          padding: '0 15px',
          marginRight: '-15px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Flex
          justify="center"
          align="center"
          style={{
            width: 33,
            height: 33,
            borderStyle: 'solid',
            borderRadius: '50%',
            borderWidth: '2px',
            borderColor: '@brand-primary',
            boxSizing: 'border-box',
          }}
        >
          <Jazzicon diameter={25} seed={jsNumberForAddress(current)} />
        </Flex>
      </div>
    </Popover>
  );
}

export default SelectAccount;
