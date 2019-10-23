export default {
  namespace: 'transactions',
  state: {
    records: [],
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

    insertTx(state, { txMeta }) {
      const { records } = state;

      if (records.length > 39) {
        const index = records.findIndex(metaTx =>
          ['failed', 'timeout', 'receipt'].includes(metaTx.status),
        );
        if (index !== -1) {
          records.splice(index, 1);
        }
      }
      records.push(txMeta);
      return {
        ...state,
        records,
      };
    },

    wipeTx(state) {
      const records = [];
      return {
        ...state,
        records,
      };
    },

    updateTx(state, { txId, txMeta }) {
      const { records } = state;
      const newRecord = records.map(t => (t.id === txId ? { ...t, ...txMeta } : t));
      return {
        ...state,
        records: newRecord,
      };
    },

    insertHistory(state, { txId, op }) {
      const { records } = state;
      let txMeta = records.filter(p => p.id === txId)[0];
      txMeta.history.push({
        op,
        timestamp: Date.now(),
      });
      const newRecord = records.map(t => (t.id === txId ? { ...t, ...txMeta } : t));
      return {
        ...state,
        records: newRecord,
      };
    },
  },

  filter: state => {
    return state;
  },
};
