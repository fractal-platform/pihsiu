import AntdIcon from '@ant-design/icons-react';
import { InputItem, Menu } from 'antd-mobile';
import { forwardRef, useState } from 'react';
import styles from './index.css';

function SelectInput(props, ref) {
  const { children, data, error, onErrorClick, value, onChange, ...restProps } = props;

  const [show, setShow] = useState(false);

  const errorAvator = (
    <span style={{ color: 'rgb(251, 61, 6)', fontSize: 21 }}>
      <AntdIcon type="exclamation-circle-o" onClick={onErrorClick} />
    </span>
  );

  return (
    <div className={show ? styles.active : ''} ref={ref}>
      <InputItem
        className={styles.input}
        placeholder={
          error ? <span style={{ color: 'rgb(251, 61, 6)' }}>{error}</span> : restProps.placeholder
        }
        extra={show ? <AntdIcon type="caret-up-o" /> : <AntdIcon type="caret-down-o" />}
        value={value}
        onChange={onChange}
        onClick={() => (restProps.editable === false ? setShow(!show) : '')}
        {...restProps}
        onExtraClick={() => setShow(!show)}
      >
        {error ? errorAvator : children}
      </InputItem>

      {show && (
        <Menu
          className={styles.menu}
          data={data}
          value={[value]}
          level={1}
          onChange={v => {
            if (onChange) {
              onChange(v[0]);
            }
            setShow(false);
          }}
          height={document.documentElement.clientHeight * 0.6}
        />
      )}
      {show && <div className={styles.menuMask} onClick={() => setShow(false)} />}
    </div>
  );
}

export default forwardRef(SelectInput);
