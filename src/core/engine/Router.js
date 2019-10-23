/**
 * Router manages a map for action and handler.
 */
export default class Router {
  /**
   * @param {any} services
   */
  constructor(services, opts = {}) {
    this.routes = {
      'pihsiu/getState': () => opts.models.state,
      'pihsiu/getStatus': services.accounts.getStatus.bind(services.accounts),
      'accounts/createNewWallet': services.accounts.createNewVaultAndKeychain.bind(
        services.accounts,
      ),
      'accounts/restoreFromSeeds': services.accounts.createNewVaultAndRestore.bind(
        services.accounts,
      ),
      'accounts/saveSeedWords': services.accounts.saveSeedWords.bind(services.accounts),
      'accounts/getSeedWords': services.accounts.getAndVerifySeedPhrase.bind(services.accounts),
      'accounts/submitPassword': services.accounts.submitPassword.bind(services.accounts),
      'accounts/add': services.accounts.addNewAccount.bind(services.accounts),
      'accounts/import': services.accounts.importAccountWithStrategy.bind(services.accounts),
      'accounts/set': services.accounts.setAccount.bind(services.accounts),
      'accounts/exportAccount': services.accounts.exportAccount.bind(services.accounts),
      'transaction/addAndSendTransaction': services.tx.addAndSendTransaction.bind(services.tx),
      'transaction/wipeTransactions': services.tx.wipeTransactions.bind(services.tx),
      'transaction/reject': services.tx.setTxStatusRejected.bind(services.tx),
      'transaction/publish': services.tx.approveTx.bind(services.tx),
      'network/setNetwork': services.network.setNetwork.bind(services.network),
      'network/updateNetwork': services.network.updateNetwork.bind(services.network),
      'network/deleteNetwork': services.network.deleteNetwork.bind(services.network),
      'preferences/setLocale': services.preferences.setLocale.bind(services.preferences),
      'preferences/getDefaultGasPrice': services.preferences.getDefaultGasPrice.bind(
        services.preferences,
      ),
      'contract/deploy': services.contract.deploy.bind(services.contract),
      'contract/query': services.contract.query.bind(services.contract),
      'contract/call': services.contract.call.bind(services.contract),
      'contract/addOrUpdateFavourite': services.contract.addOrUpdateFavourite.bind(
        services.contract,
      ),
      'contract/deleteFromFavourite': services.contract.deleteFromFavourite.bind(services.contract),
      'auth/passDomain': services.auth.passDomain.bind(services.auth),
      'auth/rejectDomain': services.auth.rejectDomain.bind(services.auth),
      'platform/openWindow': opts.platform.openWindow.bind(opts.platform),
      'platform/openContractInfoWindow': opts.platform.openContractInfoWindow.bind(opts.platform),
      'platform/loadAbi': opts.platform.loadAbi.bind(opts.platform),
      'platform/openExtensionInBrowser': opts.platform.openExtensionInBrowser.bind(opts.platform),
    };
  }

  /**
   * dispatch ui action to a handler and return results if any.
   *
   * @param {Action} action coming from ui.
   * @returns {Promise<any>} handler results.
   */
  dispatch(action) {
    if (!this.routes.hasOwnProperty(action.type)) {
      return Promise.reject(`Not found method to handle action type ${action.type}`);
    }
    return new Promise(resolve => {
      const result = this.routes[action.type](...action.payload);
      resolve(result);
    });
  }
}
