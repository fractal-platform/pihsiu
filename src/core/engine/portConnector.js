import extension from 'extensionizer';
import { getWindowType } from '../utils';

export default class PortConnector {
  constructor() {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-undef
      this.port = extension.runtime.connect(EXT_ID, {
        name: getWindowType(window.location.href),
      });
    } else {
      this.port = extension.runtime.connect({
        name: getWindowType(window.location.href),
      });
    }
  }

  addListener(cb) {
    this.port.onMessage.addListener(cb);
  }

  send(msg) {
    this.port.postMessage(msg);
  }
}
