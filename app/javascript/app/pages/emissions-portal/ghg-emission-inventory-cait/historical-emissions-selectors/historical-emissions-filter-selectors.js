/*
  filename: historical-emissions-filter-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';
import { ALL_SELECTED, API, METRIC, SECTOR_TOTAL } from 'constants';

import { getTranslate } from 'selectors/translation-selectors';
import {
  getAllSelectedOption,
  getFieldQuery,
  findOption,
  withAllSelected
} from 'selectors/filters-selectors';

import { get } from 'lodash-es';

import {
  getEmissionsData,
  getMetadataData,
  getTop10EmittersOptionLabel,
  getSelectedAPI
} from './historical-emissions-get-selectors';

const { COUNTRY_ISO } = process.env;

// OPTIONS
const CHART_TYPE_OPTIONS = [
  { label: 'Area', value: 'area' },
  { label: 'Line', value: 'line' }
];

const SOURCE_OPTIONS = [
  { label: 'CAIT', name: 'CAIT', value: 'CAIT', api: API.cw }
];

const DEFAULTS = {
  source: 'CAIT',
  breakBy: 'region-absolute',
  gas: 'ALL GHG',
  sector: ALL_SELECTED,
  region: COUNTRY_ISO,
  chartType: 'line'
};

export const getNationalOption = createSelector(
  [ getTranslate, getMetadataData ],
  (t, meta) => {
    if (!meta) return null;

    return {
      ...findOption(meta.location, COUNTRY_ISO, 'iso_code3'),
      code: COUNTRY_ISO,
      label: t('pages.emissions-portal.ghg-emission-inventory-cait.region.national'),
      override: true
    };
  }
);

const getBreakByOptions = createSelector([ getTranslate ], t => {
  const options = t('pages.emissions-portal.ghg-emission-inventory-cait.break-by', {
    default: {}
  });
  return Object
    .keys(options)
    .map(optionKey => ({ label: options[optionKey], value: optionKey }));
});

const getFieldOptions = field =>
  createSelector(
    [
      getMetadataData,
      getSelectedAPI,
      getTop10EmittersOption,
      getNationalOption,
      getFieldQuery('breakBy')
    ],
    (metadata, api, top10EmmmitersOption, nationalOption, queryBreakBy) => {
      if (!metadata || !metadata[field]) return null;

      const breakBySelected = queryBreakBy || DEFAULTS.breakBy;
      const isAbsoluteMetric = breakBySelected.includes('absolute');

      const transformToOption = o => ({
        label: o.label,
        value: String(o.value),
        code: o.iso_code3 || o.code || o.label,
        override: o.override
      });

      let options = metadata[field];

      switch (field) {
        case 'sector': {
          if (isAbsoluteMetric) {
            options = options.filter(o => o.code !== SECTOR_TOTAL);
          }
          break;
        }
        case 'location': {
          options = options.filter(o => o.iso_code3 !== COUNTRY_ISO);
          options = [
            nationalOption,
            api === API.indo ? top10EmmmitersOption : null,
            ...options
          ];
          break;
        }
        default:
      }

      return options.filter(o => o).map(transformToOption);
    }
  );

const getTop10EmittersIsoCodes = emissionData => {
  const groupedByISO = groupBy(emissionData, 'iso_code3');
  const recentYear = Math.max(...emissionData[0].emissions.map(e => e.year));

  const totalEmissionByProvince = Object
    .keys(groupedByISO)
    .filter(iso => iso !== COUNTRY_ISO)
    .map(iso => {
      const emissionObject = groupedByISO[iso].find(
        p => p.metric === METRIC.absolute && p.sector === SECTOR_TOTAL
      );

      const totalEmissionValue = (emissionObject && emissionObject.emissions
          .filter(e => e.year === recentYear)
          .map(e => e.value)[0]) || 0;

      return { iso, value: totalEmissionValue };
    });

  const sorted = sortBy(totalEmissionByProvince, 'value').reverse();

  return take(sorted, 10).map(p => p.iso);
};

export const getTop10EmittersOption = createSelector(
  [ getEmissionsData, getMetadataData, getTop10EmittersOptionLabel ],
  (data, meta, top10Label) => {
    if (!data || isEmpty(data) || !meta || !meta.location) return null;

    const top10ISOs = getTop10EmittersIsoCodes(data);
    if (top10ISOs.length !== 10) return null;

    const getLocationValuesforISOs = isos =>
      isos
        .map(iso => (findOption(meta.location, iso, 'iso_code3') || {}).value)
        .join();

    return {
      label: top10Label,
      value: getLocationValuesforISOs(top10ISOs),
      override: true
    };
  }
);

export const getTop10EmittersOptionExpanded = createSelector(
  [ getMetadataData, getTop10EmittersOption ],
  (meta, top10EmittersOption) => {
    if (!top10EmittersOption) return null;

    return top10EmittersOption.value.split(',').map(value => {
      const location = meta.location.find(
        l => String(l.value) === String(value)
      );
      return { label: location.label, value, code: location.iso_code3 };
    });
  }
);

// SELECTED
const getFieldSelected = field =>
  createSelector(
    [
      getFieldQuery(field),
      getDefaults,
      getFilterOptions,
      getAllSelectedOption
    ],
    (queryValue, defaults, options, allSelectedOption) => {
      if (!queryValue) return defaults[field];
      if (queryValue === ALL_SELECTED) return allSelectedOption;
      const findSelectedOption = value => findOption(options[field], value);
      return queryValue.includes(',')
        ? queryValue.split(',').map(v => findSelectedOption(v))
        : findSelectedOption(queryValue);
    }
  );

export const getFilterOptions = createStructuredSelector({
  source: () => SOURCE_OPTIONS,
  breakBy: getBreakByOptions,
  region: getFieldOptions('location'),
  sector: withAllSelected(getFieldOptions('sector')),
  gas: getFieldOptions('gas'),
  chartType: () => CHART_TYPE_OPTIONS
});

// DEFAULTS
const getDefaults = createSelector([ getFilterOptions ], options => ({
  source: findOption(SOURCE_OPTIONS, DEFAULTS.source),
  chartType: findOption(CHART_TYPE_OPTIONS, DEFAULTS.chartType),
  breakBy: findOption(options.breakBy, DEFAULTS.breakBy),
  region: findOption(options.region, DEFAULTS.region),
  sector: findOption(options.sector, DEFAULTS.sector),
  gas: get(options, 'gas[0]')

}));

const filterSectorSelectedByMetrics = createSelector(
  [
    getFieldSelected('sector'),
    getFieldOptions('sector'),
    getFieldSelected('breakBy')
  ],
  (sectorSelected, sectorOptions, breakBy) => {
    if (!sectorOptions || !breakBy) return null;
    if (!breakBy.value.endsWith('absolute')) {
      return sectorOptions.find(o => o.code === SECTOR_TOTAL) || sectorSelected;
    }
    return sectorSelected;
  }
);

export const getSelectedOptions = createStructuredSelector({
  source: getFieldSelected('source'),
  chartType: getFieldSelected('chartType'),
  breakBy: getFieldSelected('breakBy'),
  region: getFieldSelected('region'),
  sector: filterSectorSelectedByMetrics,
  gas: getFieldSelected('gas')
});

const getBreakBySelected = createSelector(getSelectedOptions, options => {
  if (!options || !options.breakBy) return null;
  const breakByArray = options.breakBy.value.split('-');
  return { modelSelected: breakByArray[0], metricSelected: breakByArray[1] };
});

export const getModelSelected = createSelector(
  getBreakBySelected,
  breakBySelected => (breakBySelected && breakBySelected.modelSelected) || null
);
export const getMetricSelected = createSelector(
  getBreakBySelected,
  breakBySelected => (breakBySelected && breakBySelected.metricSelected) || null
);
