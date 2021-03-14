import * as actions from './emission-projection-provider-actions';

export const initialState = {
  loading: false,
  loaded: false,
  data: {},
  error: false
};

const isActionValid = (state, timestamp) => timestamp >= state.timestamp;

export default {
  [actions.fetchEmissionProjectionInit]: (state, { payload }) => ({
    ...state,
    loading: true,
    timestamp: payload.timestamp
  }),
  [actions.fetchEmissionProjectionReady]: (state, { payload }) => {
    if (!isActionValid(state, payload.timestamp)) return state;
    
    return { ...state, loading: false, data: payload.data };
  },
  [actions.fetchEmissionProjectionFail]: (state, { payload }) => {
    if (!isActionValid(state, payload.timestamp)) return state;

    return { ...state, loading: false, error: payload.error };
  }
};
