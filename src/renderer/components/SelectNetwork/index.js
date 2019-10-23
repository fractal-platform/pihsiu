import AntdIcon from '@ant-design/icons-react';
import { Flex, Popover } from 'antd-mobile';
import { useState } from 'react';
import { FormattedMessage } from 'umi-plugin-locale';
import { rgba } from '../../utils';

function SelectNetwork(props) {
  const { current = {}, networks = [], onSelect } = props;

  const [showPopover, setShowPopover] = useState(false);

  const handleSelect = node => {
    if (onSelect) {
      onSelect(node);
    }
    setShowPopover(false);
  };

  const overlay = networks.map((net, i) => (
    <Popover.Item
      key={i}
      value={net.rpcUrl}
      icon={<AntdIcon type="wifi-o" style={{ color: net.color }} />}
    >
      {net.displayName}
      {net.displayName === current.displayName && (
        <span style={{ marginLeft: 8, color: '#009ad6' }}>
          <AntdIcon type="check-o" />
        </span>
      )}
    </Popover.Item>
  ));

  overlay.push(
    <Popover.Item key={overlay.length} value="custom" icon={<AntdIcon type="plus-circle-o" />}>
      <FormattedMessage id="customize" defaultMessage="Customize" />
    </Popover.Item>,
  );

  overlay.push(
    <Popover.Item key={overlay.length} value="nodeList" icon={<AntdIcon type="cloud-download-o" />}>
      <FormattedMessage id="settings.net.list.get" />
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
            borderRadius: '50%',
            borderStyle: 'solid',
            borderWidth: '2px',
            borderColor: rgba(current.color, 0.6),
            boxSizing: 'border-box',
          }}
        >
          <Flex
            justify="center"
            align="center"
            style={{
              width: 25,
              height: 25,
              textAlign: 'center',
              borderRadius: '50%',
              background: rgba(current.color, 0.25),
            }}
          >
            <AntdIcon type="wifi-o" style={{ color: current.color, fontSize: '20px' }} />
          </Flex>
        </Flex>
      </div>
    </Popover>
  );
}

export default SelectNetwork;
