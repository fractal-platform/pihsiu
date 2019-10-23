export default {
  namespace: 'balances',
  state: {
    current: '',
    records: [],
  },

  reducers: {
    update(state, action) {
      return {
        ...state,
        ...action,
      };
    },
  },
};
