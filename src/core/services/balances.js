import { isEqual } from 'lodash';
import BaseService from './base/BaseService';

export default class BalanceService extends BaseService {
  constructor(opts = {}) {
    super();
    this._initModels(opts.models);
    this.ruban = opts.ruban;

    opts.networkService.on(
      'networkDidChange',
      opts.blockTracker.fetchImmediately.bind(opts.blockTracker),
    );
    this.models.on('accounts:update', this.fetchBalances.bind(this));
    opts.blockTracker.on('latest', this.fetchBalances.bind(this));
  }

  fetchBalances() {
    const { identities, selectedAddress } = this.models.state.accounts;

    let current = '0';
    const balances = Object.keys(identities).map(async address => {
      const balance = await this.ruban.fra.getBalance(address);
      if (address === selectedAddress) {
        current = balance;
      }
      return { address, balance };
    });

    Promise.all(balances).then(records => {
      if (!isEqual(this.models.state.balances, { records, current })) {
        this.models.setState('balances/update', { records, current });
      }
    });
  }
}
