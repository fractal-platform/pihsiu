import { netColor } from '../../Enums';

export default {
  namespace: 'network',
  state: {
    providers: [
      {
        type: 'mainnet',
        displayName: 'Main Net',
        rpcUrl: 'http://35.170.127.58:8545/rpc',
        scanUrl: 'http://35.170.127.58:8080/',
        faucetUrl: 'http://token.testnet.fractalblock.com:8081',
        chainId: 1,
        color: netColor.GREEN,
      },
      {
        type: 'localhost',
        displayName: 'Localhost Network',
        rpcUrl: 'http://127.0.0.1:8545/rpc',
        //scanUrl
        //faucetUrl
        chainId: 999,
        color: netColor.GREY,
      },
    ],
    current: {},
    chainId: 'loading',
  },

  initialize: (state, init) => {
    return {
      ...state,
      ...init,
    };
  },

  reducers: {
    update(state, action) {
      return {
        ...state,
        ...action,
      };
    },

    updateCurrent(state, { chainId }) {
      const { providers, current } = state;
      current.chainId = chainId;
      const newProviders = providers.map(p => (p.rpcUrl === current.rpcUrl ? current : p));
      return {
        ...state,
        current,
        providers: newProviders,
        chainId,
      };
    },

    //todo lyjtodo use `URL` to check rpcUrl,scanUrl,faucetUrl
    //insert or update
    setProvider(state, provider) {
      const { providers } = state;
      let newProviders;
      if (providers.some(p => p.rpcUrl === provider.rpcUrl)) {
        newProviders = providers.map(p => (p.rpcUrl === provider.rpcUrl ? provider : p));
      } else {
        newProviders = [...providers, provider];
      }

      return {
        ...state,
        current: provider,
        chainId: 'loading',
        providers: newProviders,
      };
    },

    updateNetwork(state, { provider, rpcUrl }) {
      const { providers } = state;
      const newProviders = providers.filter(p => p.rpcUrl !== rpcUrl);
      newProviders.push(provider);
      return {
        ...state,
        providers: newProviders,
      };
    },

    deleteNetwork(state, rpcUrl) {
      const { providers } = state;
      const newProviders = providers.filter(p => p.rpcUrl !== rpcUrl);
      return {
        ...state,
        providers: newProviders,
      };
    },
  },

  filter: state => {
    const a = { ...state };
    delete a.neverPersist;
    return a;
  },
};
