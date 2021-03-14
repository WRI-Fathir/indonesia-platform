
import { createAction, createThunkAction } from 'redux-tools';
import { INDOAPI } from 'services/api';

export const fetchLocationsInit = createAction('fetchLocationsInit');
export const fetchLocationsReady = createAction('fetchLocationsReady');
export const fetchLocationsFail = createAction('fetchLocationsFail');

export const fetchLocations = createThunkAction('fetchLocations', params =>
  (dispatch, state) => {
    const { provinces } = state();
    if (!provinces.loading) {
      dispatch(fetchLocationsInit());
      INDOAPI
        .get('locations/locations', params)
        .then((data = {}) => {
          dispatch(fetchLocationsReady(data));
        })
        .catch(error => {
          console.warn(error);
          dispatch(fetchLocationsFail(error && error.message));
        });
    }
  });
