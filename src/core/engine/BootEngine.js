import debounce from 'debounce';
import EventEmitter from 'eventemitter3';
import log from 'loglevel';
import { HttpProvider } from 'ruban-providers';
import Ruban from 'rubanjs';
import PublicPusher from '../../ext/lib/publicPusher';
import BlockTracker from '../helpers/BlockTracker';
import models from '../models';
import AccountService from '../services/accounts';
import AuthService from '../services/auth';
import BalanceService from '../services/balances';
import ContractService from '../services/contract';
import NetworkService from '../services/network';
import PreferencesService from '../services/preferences';
import TransactionService from '../services/transactions';
import DappRouter from './DappRouter';
import Router from './Router';
import { getTextCodingFunction } from '../utils';

export default class BootEngine extends EventEmitter {
  constructor(opts) {
    super();

    this.defaultMaxListeners = 20;
    this.sendUpdate = debounce(this.privateSendUpdate.bind(this), 200);

    this.opts = opts;
    const initState = opts.initState || {};
    // this.recordFirstTimeInfo(initState)

    // this keeps track of how many "controllerStream" connections are open
    // the only thing that uses controller connections are open pihsiu UI instances
    this.activeControllerConnections = 0;

    // platform-specific api
    this.platform = opts.platform;

    this.models = models;
    this.models.initialize(initState);
    this.models.on('update', this.sendUpdate.bind(this));

    this.provider = new HttpProvider('http://127.0.0.1:8545/rpc', {
      headers: [
        {
          name: 'Access-Control-Allow-Origin',
          value: 'http://127.0.0.1:8545/rpc',
        },
      ],
    });

    const { TextEncoder, TextDecoder } = getTextCodingFunction();
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    //fixme: textEncoder and TextDecoder is platform sepcific. should come from platform??
    this.ruban = new Ruban(this.provider, null, {
      defaultGasPrice: 1,
      defaultGas: 9000000000,
      textEncoder,
      textDecoder,
    });

    this.blockTracker = new BlockTracker({
      models: this.models,
      ruban: this.ruban,
      interval: initState.blockTrackerInterval,
    });

    this.services = {
      auth: new AuthService({ models: this.models, platform: this.platform }),
      preferences: new PreferencesService(this.models, this.ruban),
      network: new NetworkService(this.ruban, this.models),
      accounts: new AccountService({
        models: this.models,
        encryptor: opts.encryptor || undefined,
        ruban: this.ruban,
      }),
    };

    this.services.balances = new BalanceService({
      models: this.models,
      ruban: this.ruban,
      blockTracker: this.blockTracker,
      networkService: this.services.network,
    });

    this.services.tx = new TransactionService({
      models: this.models,
      ruban: this.ruban,
      addPrivateKeyToWallet: this.services.accounts.addPrivateKeyToWallet.bind(
        this.services.accounts,
      ),
      platform: this.platform,
    });

    this.services.contract = new ContractService({
      models: this.models,
      addAndSendTransaction: this.services.tx.addAndSendTransaction.bind(this.services.tx),
      tx: this.services.tx,
      platform: this.platform,
      textEncoder,
      textDecoder,
      ruban: this.ruban,
    });

    this.services.tx.on(`tx:status-update`, async (txId, status) => {
      if (['confirmed', 'failed', 'timeout'].includes(status)) {
        const {
          transactions: { records },
          network: {
            current: { scanUrl },
          },
        } = this.models.state;
        const txMeta = records.filter(t => t.id === txId)[0];
        const txHash = txMeta.hash;
        this.platform.showTransactionNotification(txMeta, scanUrl, txHash);
      }
    });

    updateBadge.call(this);
    this.services.tx.on('update:badge', updateBadge.bind(this));

    function updateBadge() {
      const vault = models.state.transactions.records;
      let label = '';
      const count = vault.filter(tx => tx.status === 'submitted').length;
      if (count) {
        label = String(count);
      }
      this.platform.updateBadge(label);
    }

    this.router = new Router(this.services, { models: this.models, platform: this.platform });
    this.dappRouter = new DappRouter(this.services, {
      models: this.models,
      platform: this.platform,
    });

    // ensure isClientOpenAndUnlocked is updated when memState updates
    // this.on('update', memState => {
    //   this.isClientOpenAndUnlocked = memState.accounts.isUnlocked && this._isClientOpen;
    // });
  }

  setupContentCommunication(port, originDomain) {
    const publicPusher = new PublicPusher(port, this.models);

    port.onMessage.addListener(action => {
      let resp = { type: action.type, nonce: action.nonce };
      if (action.siteMeta) {
        publicPusher.setOrigin(action.origin);
        this.services.auth
          .addCandidates(action.siteMeta)
          .then(() => {
            this.dappRouter
              .dispatch(action)
              .then(result => {
                resp.payload = result;
                resp.auth = 'pass';
                port.postMessage(resp);
              })
              .catch(error => {
                resp.payload = error;
                resp.auth = 'pass';
                resp.error = error.message;
                port.postMessage(resp);
              });
          })
          .catch(() => {
            resp.auth = 'rejected';
            port.postMessage(resp);
          });
      } else if (this.services.auth.check(action.origin)) {
        this.dappRouter
          .dispatch(action)
          .then(result => {
            resp.payload = result;
            port.postMessage(resp);
          })
          .catch(error => {
            resp.payload = error;
            resp.error = error.message;
            port.postMessage(resp);
          });
      } else {
        resp.error = 'User did not allow this site to connect to pihsiu';
        resp.auth = 'rejected';
        port.postMessage(resp);
      }
    });
  }

  setupTrustedCommunication(port, originDomain) {
    port.onMessage.addListener(action => {
      log.debug('pihsiu got action:', JSON.stringify(action));
      let resp = { type: action.type, nonce: action.nonce };
      this.router
        .dispatch(action)
        .then(result => {
          resp.payload = result;
          port.postMessage(resp);
        })
        .catch(error => {
          resp.payload = error;
          resp.error = error.message;
          port.postMessage(resp);
        });
    });

    port.postMessage({
      type: 'pihsiuState/initial',
      payload: this.getState(),
    });
  }

  privateSendUpdate() {
    this.emit('update', this.getState());
  }

  getState() {
    const vault = this.models.state.accounts.vault;
    const isInitialized = !!vault;

    return {
      ...{ isInitialized },
      ...this.models.state,
    };
  }
}
