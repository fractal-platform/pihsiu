import bc from '@/service';
import log from 'loglevel';

export default {
  namespace: 'test',

  state: {
    result: '',
  },

  effects: {
    *sendAction({ payload }, { call, put }) {
      const resp = yield call(bc.sendAsync, payload.action);
      log.debug('test page got: ', resp);
      yield put({
        type: 'update',
        payload: {
          result: JSON.stringify(resp),
        },
      });
    },
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
