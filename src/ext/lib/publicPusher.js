import log from 'loglevel';

export default class PublicPusher {
  constructor(port, models) {
    this.oldRpcUrl = undefined;
    this.oldSelectedAddress = undefined;
    this.origin = undefined;
    this.port = port;
    this.models = models;

    this._postMessage();

    this.models.on('update', this.push.bind(this));
    this.port.onDisconnect.addListener(() => {
      this.models.off('update', this.push);
    });
  }

  setOrigin(origin) {
    this.origin = origin;
  }

  push(state) {
    const {
      auth: { candidates, passes },
    } = state;
    if (!this.origin || (!candidates[this.origin] && !passes[this.origin])) {
      return;
    }
    this._postMessage();
  }

  _postMessage() {
    const {
      accounts: { selectedAddress },
      network: {
        current: { rpcUrl },
      },
    } = this.models.state;
    if (this.oldRpcUrl === rpcUrl && this.oldSelectedAddress === selectedAddress) {
      log.info(`${this.origin} rpcUrl and selectedAddress not change,don't send`);
      return;
    }
    this.oldSelectedAddress = selectedAddress;
    this.oldRpcUrl = rpcUrl;
    try {
      this.port.postMessage({
        type: 'stateChanged',
        payload: {
          selectedAddress,
          rpcUrl,
        },
      });
    } catch (e) {
      log.error('publicPusher', e);
    }
  }
}
