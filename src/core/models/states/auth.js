import log from 'loglevel';

export default {
  namespace: 'auth',

  state: {
    candidates: {},
    passes: {},
  },

  reducers: {
    addCandidates: (state, siteMeta) => {
      if (!siteMeta.origin) {
        log.warn('add new siteMeta without origin');
        return { ...state };
      }
      return {
        ...state,
        candidates: {
          ...state.candidates,
          [siteMeta.origin]: siteMeta,
        },
      };
    },

    passDomain: (state, { origin }) => {
      const { candidates, passes } = state;
      const siteMeta = candidates[origin];
      delete candidates[origin];
      return {
        ...state,
        candidates,
        passes: {
          ...passes,
          [origin]: siteMeta,
        },
      };
    },

    rejectDomain: (state, { origin }) => {
      const { candidates, passes } = state;
      delete candidates[origin];
      delete passes[origin];
      return {
        ...state,
        candidates,
        passes,
      };
    },
  },

  filter: state => {
    return {};
  },
};
