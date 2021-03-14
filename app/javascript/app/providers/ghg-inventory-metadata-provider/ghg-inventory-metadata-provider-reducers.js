import camelCase from 'lodash/camelCase';
import sortBy from 'lodash/sortBy';
import * as actions from './ghg-inventory-metadata-provider-actions';

export const initialState = {
  ghgindo: { loading: false, loaded: false, error: false, data: null },
  ghgcw: { loading: false, loaded: false, error: false, data: null },
  modal: { loading: false, loaded: false, error: false, data: null }
};

function parseDataByMeta(data, meta) {
  switch (meta) {
    case 'ghgindo':
    case 'ghgcw': {
      const dataParsed = {};
      Object.keys(data).forEach(
        key => {
          const camelCasedkey = camelCase(key);
          dataParsed[camelCasedkey] = sortBy(
            data[key].map(item => {
              let newItem = {
                value: item.id,
                label: key === 'location'
                  ? item.wri_standard_name.trim()
                  : item.name.trim(),
                ...item
              };
              if (key === 'location') {
                newItem = { ...newItem, iso_code3: item.iso_code3 };
              }
              if (key === 'dataSource') {
                newItem = {
                  ...newItem,
                  location: item.location_ids,
                  sector: item.sector_ids,
                  gas: item.gas_ids,
                  gwp: item.gwp_ids,
                  source: item.source.replace('historical_emissions_', '')
                };
              }
              return newItem;
            }),
            'label'
          );
        },
        this
      );
      return dataParsed;
    }
    default:
      return data;
  }
}

export default {
  [actions.fetchMetaInit]: (state, { payload }) => ({
    ...state,
    [payload.meta]: { ...state[payload.meta], loading: true }
  }),
  [actions.fetchMetaReady]: (state, { payload }) => ({
    ...state,
    [payload.meta]: {
      ...state[payload.meta],
      loading: false,
      locale: payload.locale,
      data: parseDataByMeta(payload.data, payload.meta)
    }
  }),
  [actions.fetchMetaFail]: (state, { payload }) => ({
    ...state,
    [payload.meta]: {
      ...state[payload.meta],
      loading: false,
      error: payload.error
    }
  })
};
