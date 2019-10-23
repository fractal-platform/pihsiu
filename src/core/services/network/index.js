import { isEmpty } from 'lodash';
import log from 'loglevel';
import { HttpProvider } from 'ruban-providers';
import StatableEmitter from '../base/StatableEmitter';

export default class NetworkService extends StatableEmitter {
  constructor(ruban, models) {
    super(models);
    this.ruban = ruban;
    this._httpProvider = null;

    this.on('networkDidChange', this.lookupNetwork);

    const { providers, current } = this.models.state.network;

    this.setNetwork(isEmpty(current) ? providers[0] : current);

    setInterval(() => {
      this.lookupNetwork();
    }, 20 * 1000);
  }

  /**
   * 更换网络
   * 修改 ruban 的 provider
   *
   * @param { provider }
   */
  setNetwork(provider) {
    this._httpProvider = new HttpProvider(provider.rpcUrl, {
      withCredentials: false,
      timeout: 10 * 1000,
    });
    this.ruban.setProvider(this._httpProvider);
    this.models.setState('network/setProvider', provider);
    this.emit('networkDidChange');
  }

  updateNetwork(provider, rpcUrl) {
    this.models.setState('network/updateNetwork', { provider, rpcUrl });
    const { current } = this.models.state.network;
    if (rpcUrl === current.rpcUrl) {
      this.setNetwork(provider);
    }
  }

  deleteNetwork(rpcUrl) {
    this.models.setState('network/deleteNetwork', rpcUrl);
  }

  /**
   把 'loading' 改成真实的 chainid
   查询 chainid 就放在chainIdStore里
   查询不到就还是 'loading'
   */
  lookupNetwork() {
    // Prevent firing when provider is not defined.
    if (!this._httpProvider) {
      return log.warn('NetworkController - lookupNetwork aborted due to missing provider');
    }
    const initialNetwork = this.models.state.network.chainId;
    this.ruban.fra
      .getChainId()
      .then(chainId => {
        const currentNetwork = this.models.state.network.chainId;
        if (initialNetwork === currentNetwork) {
          log.debug('ruban.getNetwork returned ' + chainId);
          this.models.setState('network/updateCurrent', { chainId });
        }
      })
      .catch(e => {
        log.warn('ruban.getNetwork throw ' + e);
        this.models.setState('network/update', { chainId: 'loading' });
      });
  }
}
