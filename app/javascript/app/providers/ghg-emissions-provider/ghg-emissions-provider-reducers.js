import * as actions from './ghg-emissions-provider-actions';

export const initialState = {
  loading: false,
  loaded: false,
  data: {},
  error: false
};

const isActionValid = (state, timestamp) => timestamp >= state.timestamp;

export default {
  [actions.fetchGHGEmissionsInit]: (state, { payload }) => ({
    ...state,
    loading: true,
    timestamp: payload.timestamp
  }),
  [actions.fetchGHGEmissionsReady]: (state, { payload }) => {
    if (!isActionValid(state, payload.timestamp)) return state;
    
    return { ...state, loading: false, data: payload.data };
  },
  [actions.fetchGHGEmissionsFail]: (state, { payload }) => {
    if (!isActionValid(state, payload.timestamp)) return state;

    return { ...state, loading: false, error: payload.error };
  }
};
