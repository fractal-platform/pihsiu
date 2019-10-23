import extension from 'extensionizer';

export default class PortConnector {
  constructor() {
    this.port = extension.runtime.connect({
      name: '',
    });
  }

  addListener(cb) {
    this.port.onMessage.addListener(cb);
  }

  send(msg) {
    this.port.postMessage(msg);
  }
}
