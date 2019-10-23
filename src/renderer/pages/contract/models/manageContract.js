export default {
  namespace: 'manageContract',

  state: {
    contractAddress: '',
    name: '',
    edit: false,
  },

  reducers: {
    update(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    clear() {
      return {
        contractAddress: '',
        name: '',
        edit: false,
      };
    },
  },
};
