export default {
  state: {
    selected: {},
  },

  reducers: {
    setSelected: (state, { payload }) => {
      return {
        ...state,
        selected: payload,
      };
    },
  },
};
