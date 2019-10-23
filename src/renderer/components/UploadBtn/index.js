import { Button, Flex, Toast } from 'antd-mobile';
import { forwardRef, useState } from 'react';
import cls from './index.css';

function UploadBtn(props, ref) {
  const {
    id,
    children,
    placeholder,
    error,
    suffixs,
    contentType = 'hex', // hex or text
    onChange,
    styles,
    btnStyles,
    btnType,
    pStyles,
  } = props;

  const [status, setStatus] = useState('');

  const handleSelect = evt => {
    if (evt.target.files.length === 0) {
      return;
    }

    const f = evt.target.files[0];

    if (suffixs) {
      const suf = f.name.split('.').pop();
      if (!suffixs.includes(suf)) {
        console.warn(`Invalid file type, require ${suffixs}, got ${suf}`);
        Toast.fail('Invalid file type');
        if (onChange) {
          onChange(undefined);
        }
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = ev => {
      setStatus(f.name);
      if (onChange) {
        onChange(ev.target.result);
      }
    };
    if (contentType === 'hex') {
      reader.readAsArrayBuffer(f);
    } else if (contentType === 'text') {
      reader.readAsText(f);
    }
  };

  return (
    <Flex style={styles} ref={ref}>
      <Flex.Item className={cls.upload}>
        <label htmlFor={id}>
          <input id={id} type="file" style={{ display: 'none' }} onChange={handleSelect} />
          <Button className={cls.btn} type={btnType || 'ghost'} style={btnStyles}>
            {children}
          </Button>
        </label>
      </Flex.Item>
      <Flex.Item
        style={{ ...pStyles, color: error ? 'rgb(251, 61, 6)' : 'var(--help-font-color)' }}
      >
        <p style={{ wordBreak: 'break-all' }}>{error || status || placeholder}</p>
      </Flex.Item>
    </Flex>
  );
}

export default forwardRef(UploadBtn);
