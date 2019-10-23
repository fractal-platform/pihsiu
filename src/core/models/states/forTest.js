export default {
  namespace: 'forTest',
  state: {},
  initialize: (state, init) => {
    return {
      ...state,
      ...init,
    };
  },

  reducers: {
    addInt(state, { i }) {
      return {
        ...state,
        i,
      };
    },

    addMemoryVar(state, { value }) {
      return {
        ...state,
        neverPersist: value,
      };
    },
  },

  filter: state => {
    const a = { ...state };
    delete a.neverPersist;
    return a;
  },
};
