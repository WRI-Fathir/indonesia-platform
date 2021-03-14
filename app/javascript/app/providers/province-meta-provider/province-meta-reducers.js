import * as actions from './province-meta-actions';

export const initialState = {
  loading: false,
  loaded: false,
  data: {},
  error: false
};

export default {
  [actions.fetchProvinceMetasInit]: state => ({ ...state, loading: true }),
  [actions.fetchProvinceMetasReady]: (state, { payload }) => ({
    ...state,
    loading: false,
    data: payload
  }),
  [actions.fetchProvinceMetasFail]: (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload
  })
};
