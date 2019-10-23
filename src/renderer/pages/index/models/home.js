export default {
  namespace: 'home',

  state: {
    activeTab: 'home',
  },

  reducers: {
    update(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
