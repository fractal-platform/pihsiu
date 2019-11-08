/**
 * Router manages a map for action and handler.
 */
export default class DappRouter {
  /**
   * @param {any} services
   */
  constructor(services, opts = {}) {
    this.routes = {
      'transaction/sendRawTransaction': services.tx.sendRawTxFromDapp.bind(services.tx),
      'transaction/addTxFromDapp': services.tx.addTxFromDapp.bind(services.tx),
      'account/sign': services.accounts.sign.bind(services.accounts),
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
