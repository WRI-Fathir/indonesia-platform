import * as actions from './policies-provider-actions';

export const initialState = {
  loading: false,
  loaded: false,
  data: {},
  error: false
};

export default {
  [actions.fetchPoliciesInit]: state => ({ ...state, loading: true }),
  [actions.fetchPoliciesReady]: (state, { payload }) => ({
    ...state,
    loading: false,
    data: payload
  }),
  [actions.fetchPoliciesFail]: (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload
  })
};
