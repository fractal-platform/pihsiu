import log from 'loglevel';
import { cleanErrorStack, createRandomId } from '../../utils';
import StatableEmitter from '../base/StatableEmitter';
import { normalizeTxParams, validateTxParams } from './lib/util';

export default class TransactionService extends StatableEmitter {
  constructor(opts) {
    super(opts.models);
    this.ruban = opts.ruban;
    this.addPrivateKeyToWallet = opts.addPrivateKeyToWallet;
    this.platform = opts.platform;

    this.models.on('transactions:update', () => this.emit('update:badge'));
  }

  /**
   * 删除所有交易
   @param {string} address - hex string of the from address for txs being removed
   */
  wipeTransactions() {
    this.models.setState('transactions/wipeTx');
  }

  /**
   * 最主要的暴露的函数
   * 把一个交易加入队列并且发送
   @returns {Promise<string>} the hash of the transaction after being submitted to the network
   @param txParams {object} - txParams for the transaction
   @param opts {object} - with the key origin to put the origin on the txMeta
   */
  async addAndSendTransaction(txParams, opts = {}) {
    const initialTxMeta = await this.addUnapprovedTransaction(txParams, opts);
    const txId = initialTxMeta.id;
    try {
      this.publishTransaction(txId);
      // must set transaction to submitted/failed before releasing lock
    } catch (err) {
      // this is try-catch wrapped so that we can guarantee that the nonceLock is released
      try {
        this.setTxStatusFailed(txId, err);
        return new Promise((resolve, reject) => {
          reject({
            txId,
            txHash: initialTxMeta.hash,
            err: cleanErrorStack(new Error('failed to publish transaction')),
          });
        });
      } catch (err) {
        log.error(err);
      }
      throw err;
    }

    const timeoutId = setTimeout(() => {
      const txMeta = this.getTx(txId);
      if (!['timeout', 'failed', 'receipt'].includes(txMeta.status)) {
        this.models.setState('transactions/updateTx', {
          txId,
          txMeta: {
            err: {
              message: 'tx timeout, check scan for final result.',
            },
          },
        });
        this._setTxStatus(txId, 'timeout');
      }
    }, 1000 * 60 * 8);
    this.once(`${txId}:finished`, finishedTxMeta => {
      clearTimeout(timeoutId);
    });

    return txId;
  }

  /**
   Validates and generates a txMeta with defaults and puts it in store

   @param {txParams}
   @returns {txMeta}
   */
  addUnapprovedTransaction(txParams, opts) {
    const normalizedTxParams = normalizeTxParams(txParams);
    const {
      accounts: { selectedAddress: address },
      network: { chainId, current: provider },
      balances: { current: balance },
    } = this.models.state;

    if (chainId === 'loading') {
      throw new Error('Pihsiu is having trouble connecting to the network');
    }
    if (normalizedTxParams.from !== address) {
      throw new Error(
        `Transaction from address isn't valid for this account;Maybe account is not lowerCased or Pihsiu don't have this account`,
      );
    }
    const amount = parseInt(normalizedTxParams.value)
      ? parseInt(normalizedTxParams.value) +
        parseInt(normalizedTxParams.gas) * parseInt(normalizedTxParams.gasPrice)
      : parseInt(normalizedTxParams.gas) * parseInt(normalizedTxParams.gasPrice);
    if (amount > balance) {
      throw new Error(`Balance insufficient`);
    }

    validateTxParams(normalizedTxParams);
    const txMeta = {
      chainId,
      provider,
      id: createRandomId(),
      history: [],
      status: 'unapproved',
      txParams: normalizedTxParams ? this.normalizeAndValidateTxParams(normalizedTxParams) : {},
      submittedTime: new Date().getTime(),
      ...opts,
    };
    this.models.setState('transactions/insertTx', { txMeta });
    return txMeta;
  }

  /**
   publishes the raw tx and sets the txMeta to submitted
   @param txId {number} - the tx's Id
   @param rawTx {string} - the hex string of the serialized signed transaction
   @returns {Promise<void>}
   */
  async publishTransaction(txId) {
    const txMeta = this.getTx(txId);

    //only `unapproved` transaction can be published
    if (!txMeta || txMeta.status !== 'unapproved') {
      return;
    }

    const {
      network: { chainId },
    } = this.models.state;
    const txParams = Object.assign({}, txMeta.txParams, { chainId });

    const fromAddress = txParams.from;
    try {
      await this.addPrivateKeyToWallet(fromAddress);
    } catch (e) {
      this.setTxStatusFailed(txId, e);
      return;
    }

    this.ruban.fra
      .sendTransaction(txParams)
      .on('error', error => {
        log.debug(error);
        if (error.message && error.message.startsWith('Node error:')) {
          // looks like: Node error: {"message": "xxxxx", "code": -21000}
          try {
            error.message = JSON.parse(error.message.split('error:', 2)[1].trim()).message;
          } catch (e) {
            log.warn(`error message parse failed.${error.message}`);
          }
        }
        this.setTxStatusFailed(txId, error);
      })
      .on('transactionHash', transactionHash => {
        this.models.setState('transactions/updateTx', {
          txId,
          txMeta: {
            hash: transactionHash,
            submittedTime: new Date().getTime(),
          },
        });
        this._setTxStatus(txId, 'submitted');
      })
      .on('receipt', receipt => {
        this._setTxStatus(txId, 'receipt');
      })
      .on('confirmation', async (confirmationNumber, receipt) => {
        log.debug('confirmationNumber: ' + confirmationNumber);
        if (confirmationNumber === 2) {
          this.confirmTransaction(txId, receipt.receipt);
        }
      });
  }

  /**
   * Sets the status of the transaction to confirmed and sets the status of nonce duplicates as
   * dropped if the txParams have data it will fetch the txReceipt
   * @param {number} txId - The tx's ID
   * @returns {Promise<void>}
   */
  async confirmTransaction(txId, txReceipt) {
    // get the txReceipt before marking the transaction confirmed
    // to ensure the receipt is gotten before the ui revives the tx
    const txMeta = this.getTx(txId);

    if (!txMeta) {
      return;
    }

    txMeta.txReceipt = {
      ...txReceipt,
    };

    this._setTxStatus(txId, 'confirmed');
  }

  /**
   @param txId {number}
   @returns {transaction} the txMeta who matches the given id if none found
   for the network returns undefined
   */
  getTx(txId) {
    const {
      transactions: { records },
    } = this.models.state;
    return records.filter(t => t.id === txId)[0];
  }

  /**
   * normalize and validate txParams members
   * @param txParams {object} - txParams
   */
  normalizeAndValidateTxParams(txParams) {
    if (typeof txParams.data === 'undefined') {
      delete txParams.data;
    }
    txParams = normalizeTxParams(txParams, false);
    return txParams;
  }

  /**
   should update the status of the tx to 'failed'.
   and put the error on the txMeta
   @param txId {number} - the txMeta Id
   @param err {erroObject} - error object
   */
  setTxStatusFailed(txId, err) {
    const error = !err ? new Error('Internal pihsiu failure') : err;
    let txMeta = {
      txId,
      txMeta: {
        err: {
          message: JSON.stringify(error),
          rpc: error.value,
          stack: error.stack,
        },
      },
    };
    const txMetaOrigin = this.getTx(txId);
    if (!txMetaOrigin.submittedTime) {
      txMeta.submittedTime = new Date().getTime();
    }

    this.models.setState('transactions/updateTx', txMeta);
    this._setTxStatus(txId, 'failed');
  }

  /**
   @param txId {number} - the txMeta Id
   @param status {string} - the status to set on the txMeta
   @emits tx:status-update - passes txId and status
   @emits ${txMeta.id}:finished - if it is a finished state. Passes the txMeta
   @emits update:badge
   */
  _setTxStatus(txId, status) {
    this.models.setState('transactions/updateTx', { txId, txMeta: { status } });
    const txMeta = this.getTx(txId);

    setTimeout(() => {
      try {
        this.models.setState('transactions/insertHistory', { txId, op: status });
        this.emit(`tx:status-update`, txId, status);
        if (['receipt', 'failed', 'timeout'].includes(status)) {
          this.emit(`${txMeta.id}:finished`, txMeta);
        }
        if (['submitted', 'rejected'].includes(status)) {
          this.emit(`${txMeta.id}:${status}`, txMeta);
        }
        if (status === 'confirmed') {
          this.emit(`${txMeta.id}:confirmed`, txMeta);
        }
      } catch (error) {
        log.error(error);
      }
    });
  }

  setTxStatusRejected(txId) {
    this._setTxStatus(txId, 'rejected');
    this.platform.closeCurrentWindow();
  }

  approveTx(txId) {
    this.publishTransaction(txId);
    this.platform.closeCurrentWindow();
  }

  sendRawTxFromDapp(txId, origin) {
    log.debug('sendRawTxFromDapp', txId);
    this.platform.showpopup(`/notify/tx/${txId}`, `origin=${origin}`);

    return new Promise((resolve, reject) => {
      this.once(`${txId}:submitted`, txMeta => {
        resolve(txMeta.hash);
      });
      this.once(`${txId}:rejected`, () => {
        reject('user reject');
      });
    });
  }

  addTxFromDapp(txParam) {
    const txMeta = this.addUnapprovedTransaction(txParam, { origin: 'Dapp' });
    return txMeta.id;
  }
}
