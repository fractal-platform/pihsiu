export default {
  state: {
    // loading, success, fail
    connected: 'loading',
  },

  reducers: {
    setConnected(state, { payload }) {
      return {
        ...state,
        connected: payload,
      };
    },
  },
};
