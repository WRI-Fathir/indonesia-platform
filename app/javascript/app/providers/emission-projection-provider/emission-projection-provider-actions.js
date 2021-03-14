import { createAction, createThunkAction } from 'redux-tools';
import { INDOAPI, CWAPI } from 'services/api';
import { API, METRIC } from 'constants';

export const fetchEmissionProjectionInit = createAction('fetchEmissionProjectionInit');
export const fetchEmissionProjectionReady = createAction('fetchEmissionProjectionReady');
export const fetchEmissionProjectionFail = createAction('fetchEmissionProjectionFail');

const normalizeCWAPIData = data =>
  data.map(d => ({ ...d, metric: METRIC.absolute }));

export const fetchEmissionProjection = createThunkAction(
  'fetchEmissionProjection',
  params => dispatch => {
    const timestamp = new Date();
    dispatch(fetchEmissionProjectionInit({ timestamp }));
    const { api, ...paramsWithoutAPI } = params;
    const cwAPI = api === API.cw;
    (cwAPI ? CWAPI : INDOAPI)
      .get('emission_projections', paramsWithoutAPI)
      .then((data = {}) => {
        dispatch(
          fetchEmissionProjectionReady({
            data: data,
            timestamp
          })
        );
      })
      .catch(error => {
        console.warn(error);
        dispatch(
          fetchEmissionProjectionFail({ error: error && error.message, timestamp })
        );
      });
  }
);
