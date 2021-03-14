import { createAction, createThunkAction } from 'redux-tools';
import { INDOAPI } from 'services/api';

export const fetchPoliciesInit = createAction('fetchPoliciesInit');
export const fetchPoliciesReady = createAction('fetchPoliciesReady');
export const fetchPoliciesFail = createAction('fetchPoliciesFail');

export const fetchPolicies = createThunkAction('fetchPolicies', params =>
  (dispatch, state) => {
    const { policies } = state();
    if (!policies.loading) {
      dispatch(fetchPoliciesInit());
      INDOAPI
        .get('province/policies', params)
        .then((data = {}) => {
          dispatch(fetchPoliciesReady(data));
        })
        .catch(error => {
          console.warn(error);
          dispatch(fetchPoliciesFail(error && error.message));
        });
    }
  });
