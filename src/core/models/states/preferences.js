export default {
  namespace: 'preferences',
  state: {
    locale: 'en-US',
  },
  reducers: {
    update: (state, action) => {
      return {
        ...state,
        ...action,
      };
    },
  },
};
