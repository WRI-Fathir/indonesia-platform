import { createAction, createThunkAction } from 'redux-tools';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import snakeCase from 'lodash/snakeCase';

import { INDOAPI, CWAPI } from 'services/api';
import { METRIC } from 'constants';

const { COUNTRY_ISO } = process.env;

export const fetchMetaInit = createAction('fetchMetaInit');
export const fetchMetaReady = createAction('fetchMetaReady');
export const fetchMetaFail = createAction('fetchMetaFail');

function filterCWMeta(metadata) {
  const CAIT = metadata.data_source.find(d => d.name === 'CAIT');
  const metric = [
    { code: METRIC.absolute, name: 'Absolute metric', unit: 'MtCO2e' },
    {
      code: METRIC.per_capita,
      name: 'Emission per capita',
      unit: 'MtCO2e/Capita'
    },
    {
      code: METRIC.per_gdp,
      name: 'Emission per GDP',
      unit: 'MtCO2e/million USD'
    }
  ];

  return {
    data_source: metadata.data_source.filter(d => d.id === CAIT.id),
    gas: metadata.gas
      .filter(g => CAIT.gas_ids.includes(g.id) && g.name === 'All GHG')
      .map(g => ({ ...g, code: snakeCase(g.name).toUpperCase() })),
    location: metadata.location.filter(l => l.iso_code3 === COUNTRY_ISO),
    sector: metadata.sector
      .filter(s => CAIT.sector_ids.includes(s.id))
      .filter(d => isEmpty(d.aggregated_sector_ids))
      .filter(d => !d.parent_id),
    metric
  };
}

function getDataByMeta(meta, params) {
  switch (meta) {
    case 'ghgcw':
      return CWAPI.get('emissions/meta', params).then(filterCWMeta);
    case 'ghgindo':
      return INDOAPI.get('emissions/meta', params);
    case 'modal':
      return INDOAPI.get('metadata', params);
    default:
      return Promise.reject(new Error(
        `No metadata endpoint found for ${meta}`
      ));
  }
}

export const fetchMeta = createThunkAction('fetchMeta', params =>
  (dispatch, state) => {
    const { metadata = {} } = state();
    const { meta: paramMeta, locale, inventory, sector, category } = params;
    const metas = isArray(paramMeta) ? paramMeta : [ paramMeta ];
    metas.forEach(meta => {
      if (
        metadata[meta] &&
          (isEmpty(metadata[meta].data) || metadata[meta].locale !== locale) &&
          !metadata[meta].loading
      ) {
        dispatch(fetchMetaInit({ meta }));
        getDataByMeta(meta, { locale, inventory, sector, category })
          .then((data = {}) => {
            dispatch(fetchMetaReady({ meta, data, locale }));
          })
          .catch(error => {
            console.warn(error);
            dispatch(fetchMetaFail({ meta, error: error && error.message }));
          });
      }
    });
  });
