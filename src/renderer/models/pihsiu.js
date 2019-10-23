import { Toast } from 'antd-mobile';
import log from 'loglevel';
import { getLocale, setLocale } from 'umi-plugin-locale';
import router from 'umi/router';
import bc from '../service';

export default {
  state: {
    auth: {},
    accounts: {},
    balances: {},
    network: { current: {} },
    preferences: {},
    transactions: {},
    contract: {},
  },

  effects: {
    *fetchInitial(_, { call, put }) {
      const resp = yield call(bc.sendAsync, { type: 'pihsiu/getState' });
      yield put({
        type: 'update',
        payload: resp.payload,
      });
    },

    *fetchSeedWords(_, { call, put }) {
      const resp = yield call(bc.sendAsync, { type: 'accounts/getSeedWords' });
      if (!resp.error) {
        const seedWords = resp.payload.split(' ');
        yield put({
          type: 'updateSeedWords',
          payload: {
            seedWords,
            confirmWords: [...seedWords].sort(() => {
              return 0.5 - Math.random();
            }),
          },
        });
      }
    },

    * saveSeedWords(_, { call }) {
      const resp = yield call(bc.sendAsync, { type: 'accounts/saveSeedWords' });
      return resp;
    },

    *createWallet(
      {
        payload: { password },
      },
      { call, put },
    ) {
      const resp = yield call(bc.sendAsync, {
        type: 'accounts/createNewWallet',
        payload: [password],
      });
      if (!resp.error) {
        yield put({ type: 'fetchSeedWords' });
        router.push('/seed/record');
      } else {
        Toast.fail(resp.error);
      }
    },

    *restore({ payload }, { call }) {
      const { password, seedWords } = payload;
      return yield call(bc.sendAsync, {
        type: 'accounts/restoreFromSeeds',
        payload: [password, seedWords.trim()],
      });
    },

    *login({ payload }, { call }) {
      const { password } = payload;

      const resp = yield call(bc.sendAsync, {
        type: 'accounts/submitPassword',
        payload: [password],
      });
      if (!resp.error) {
        router.goBack();
      } else {
        Toast.fail(resp.error);
      }
    },

    *setNetwork({ payload }, { call }) {
      const resp = yield call(bc.sendAsync, {
        type: 'network/setNetwork',
        payload: [payload],
      });
      return resp;
    },

    * updateNetwork({ payload }, { call }) {
      const resp = yield call(bc.sendAsync, {
        type: 'network/updateNetwork',
        payload: [payload.provider, payload.rpcUrl],
      });
      return resp;
    },

    * deleteNetwork({ payload }, { call }) {
      const resp = yield call(bc.sendAsync, {
        type: 'network/deleteNetwork',
        payload: payload,
      });
      return resp;
    },

    *setLocale({ payload }, { call }) {
      yield call(bc.sendAction, {
        type: 'preferences/setLocale',
        payload: [payload],
      });
    },

    *sendTx({ txParams }, { call }) {
      const resp = yield call(bc.sendAsync, {
        type: 'transaction/addAndSendTransaction',
        payload: [txParams, { origin: 'Pihsiu' }],
      });
      if (resp.error || !resp.payload) {
        Toast.fail(resp.error);
      } else {
        router.push(`/tx/Record/${resp.payload}`);
      }
    },

    *publishTx({ payload }, { call }) {
      const { txId } = payload;
      yield call(bc.sendAsync, {
        type: 'transaction/publish',
        payload: [parseInt(txId)],
      });
    },

    *rejectTx({ payload }, { call }) {
      const { txId } = payload;
      yield call(bc.sendAsync, {
        type: 'transaction/reject',
        payload: [parseInt(txId)],
      });
    },

    *getDefaultGasPrice(_, { call }) {
      yield call(bc.sendAction, {
        type: 'preferences/getDefaultGasPrice',
      });
    },

    *addAccount({ payload }, { call }) {
      const { name, privateKey } = payload;
      let resp;
      if (privateKey) {
        resp = yield call(bc.sendAsync, {
          type: 'accounts/import',
          payload: ['Private Key', [privateKey], name],
        });
      } else {
        resp = yield call(bc.sendAsync, {
          type: 'accounts/add',
          payload: [name],
        });
      }

      if (resp.error) {
        Toast.info('add failed');
      } else {
        Toast.info('add successful');
        router.push('/');
      }
    },

    *exportAccount({ payload }, { call }) {
      const { address } = payload;
      const resp = yield call(bc.sendAsync, { type: 'accounts/exportAccount', payload: [address] });
      return resp.payload;
    },

    *setAccount({ payload }, { call }) {
      const { address, name } = payload;
      yield call(bc.sendAction, { type: 'accounts/set', payload: [address, name] });
    },

    *wipeTx(_, { call, put }) {
      yield call(bc.sendAsync, {
        type: 'transaction/wipeTransactions',
      });
    },

    *openWindow({ payload }, { call }) {
      yield call(bc.sendAsync, {
        type: 'platform/openWindow',
        payload: [payload],
      });
    },

    *openContractInfoWindow({ payload }, { call }) {
      log.debug('openContractInfoWindow');
      yield call(bc.sendAsync, {
        type: 'platform/openContractInfoWindow',
        payload: [payload],
      });
    },

    *openExtensionInBrowser({ payload }, { call }) {
      const { route } = payload;
      yield call(bc.sendAsync, {
        type: 'platform/openExtensionInBrowser',
        payload: [route],
      });
    },

    *deployContract({ payload }, { call }) {
      const resp = yield call(bc.sendAsync, {
        type: 'contract/deploy',
        payload: [payload],
      });
      if (resp.error || !resp.payload) {
        Toast.fail(resp.error);
      } else {
        router.push(`/tx/Record/${resp.payload}`);
      }
    },

    *callContract({ payload }, { call }) {
      const { abi, txParams, callParams } = payload;
      const resp = yield call(bc.sendAsync, {
        type: 'contract/call',
        payload: [{ abi, txParams, callParams }],
      });
      if (resp.error || !resp.payload) {
        Toast.fail(resp.error);
      } else {
        router.push(`/tx/Record/${resp.payload}`);
      }
    },

    *queryContract({ payload }, { call }) {
      const { abi, contractAddress, tableName, key } = payload;
      const resp = yield call(bc.sendAsync, {
        type: 'contract/query',
        payload: [{ abi, contractAddress, tableName, key }],
      });
      return resp;
    },

    *addOrUpdateFavourite({ payload }, { call }) {
      const { contractAddress, name, abi } = payload;
      const resp = yield call(bc.sendAsync, {
        type: 'contract/addOrUpdateFavourite',
        payload: [{ contractAddress, name, abi }],
      });
      if (resp.error) {
        Toast.fail(resp.error);
      } else {
        router.push('/contract/manage');
      }
    },

    *deleteFromFavourite({ payload }, { call }) {
      const { contractAddress } = payload;
      yield call(bc.sendAsync, {
        type: 'contract/deleteFromFavourite',
        payload: [{ contractAddress }],
      });
    },

    *passDomain({ payload }, { call }) {
      const { origin } = payload;
      yield call(bc.sendAsync, {
        type: 'auth/passDomain',
        payload: [{ origin }],
      });
    },

    *rejectDomain({ payload }, { call }) {
      const { origin } = payload;
      yield call(bc.sendAsync, {
        type: 'auth/rejectDomain',
        payload: [{ origin }],
      });
    },

    *loadAbi(
      {
        payload: { contractAddress },
      },
      { call },
    ) {
      const resp = yield call(bc.sendAsync, {
        type: 'platform/loadAbi',
        payload: [contractAddress],
      });
      if (resp.error) {
        return;
      }
      return resp.payload;
    },
  },

  reducers: {
    update(state, { payload }) {
      log.debug('pihsiu update', payload);
      const {
        network: { chainId },
        accounts: { selectedAddress },
        transactions: { records },
        preferences: { locale },
      } = payload;

      if (getLocale() !== locale) {
        setLocale(locale);
      }

      payload.transactions.accessable = records.filter(
        tx => tx.chainId === chainId && tx.txParams.from === selectedAddress,
      );
      return {
        ...state,
        ...payload,
      };
    },

    updateSeedWords(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    wipeSeedWords(state) {
      const seedWords = [];
      const confirmWords = [];
      return {
        ...state,
        seedWords,
        confirmWords,
      };
    },
  },

  subscriptions: {
    setup({ dispatch }) {
      bc.on('pihsiuState/initial', msg => {
        const { payload: initState } = msg;
        dispatch({
          type: 'update',
          payload: initState,
        });
      });
    },

    updates({ dispatch }) {
      bc.on('pihsiuState/update', msg => {
        dispatch({
          type: 'update',
          payload: { ...msg.payload },
        });
      });
    },
  },
};
