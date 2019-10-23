export default {
  namespace: 'contract',
  state: {
    myContract: {},
    favourite: {},
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

    add2MyContract(state, { contractAddress, info }) {
      const { myContract } = state;
      return {
        ...state,
        myContract: {
          ...myContract,
          [contractAddress]: info,
        },
      };
    },

    addOrUpdateFavourite(state, { contractAddress, name }) {
      const { favourite } = state;
      return {
        ...state,
        favourite: {
          ...favourite,
          [contractAddress]: {
            name,
          },
        },
      };
    },

    deleteFromFavourite(state, { contractAddress }) {
      const { favourite } = state;
      delete favourite[contractAddress];
      return {
        ...state,
        favourite,
      };
    },
  },

  filter: state => {
    const a = { ...state };
    delete a.neverPersist;
    return a;
  },
};
