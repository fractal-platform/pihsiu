import { EventEmitter } from 'eventemitter3';

export default class BackgroundConnection extends EventEmitter {
  constructor(connector) {
    super();
    this.connector = connector;
    this._bindingThis.call(this);
    this.connector.addListener(this._handleMessage);
  }

  _bindingThis() {
    this._handleMessage = this._handleMessage.bind(this);
    this.sendAction = this.sendAction.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
  }

  _connectToElectron() {
    //TODO(@guojia): Implement this for electron app.
  }

  /**
   * handle message when received from background
   *
   * @param {Action | Answer} msg background action or answer
   */
  _handleMessage(msg) {
    // log.debug('popup got msg: ', msg);
    if (msg.nonce) {
      this.emit(msg.nonce, msg);
      return;
    }
    if (msg.error) {
      this.emit('error', msg);
      return;
    }
    if (msg.type) {
      this.emit(msg.type, msg);
    }
  }

  /**
   * Invoke the background without resp.
   *
   * @param {Action} action
   */
  sendAction(action) {
    this.connector.send(action);
  }

  /**
   * send an action async and got response or error.
   *
   * @param {Action} action ui action.
   * @returns {Promise<Answer>} background response.
   */
  sendAsync(action) {
    return new Promise((resolve, reject) => {
      action.payload = action.payload || [];
      const nonce = `${Math.random()}`;

      this.once(nonce, resolve);
      this.once('error', reject);

      this.sendAction({ nonce, ...action });
    });
  }
}
