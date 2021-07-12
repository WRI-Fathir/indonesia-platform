/*
  filename: ghg-emission-inventory-filter-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';
import get from 'lodash/get';
import { ALL_SELECTED, API, METRIC, SECTOR_TOTAL, SELECT_ALL } from 'constants';

import { getTranslate } from 'selectors/translation-selectors';
import {
  getAllSelectedOption,
  getFieldQuery,
  findOption,
  withAllSelected,
} from 'selectors/filters-selectors';

import {
  getEmissionsData,
  getMetadataData,
  getSelectedAPI,
  getMetadata,
} from './ghg-emission-inventory-get-selectors';

const { COUNTRY_ISO } = process.env;

// OPTIONS
const CHART_TYPE_OPTIONS = [
  { label: 'Stacked Area', value: 'area' },
  { label: 'Line', value: 'line' },
];

const SOURCE_OPTIONS = [
  { label: 'KLHK', name: 'KLHK', value: 'SIGNSa', api: API.indo },
  { label: 'CAIT', name: 'CAIT', value: 'CAIT', api: API.cw },
];

const DEFAULTS = {
  source: 'KLHK',
  breakBy: 'region-absolute',
  gas: 'CO2EQ',
  sector: ALL_SELECTED,
  region: COUNTRY_ISO,
  chartType: 'line',
  category: 'TOTAL',
  subCategory: 'TOTAL'
};

export const getNationalOption = createSelector(
  [getTranslate, getMetadataData],
  (t, meta) => {
    if (!meta) return null;

    return {
      ...findOption(meta.location, COUNTRY_ISO, 'iso_code3'),
      code: COUNTRY_ISO,
      value: COUNTRY_ISO,
      label: t('pages.emissions-portal.ghg-emission-inventory.region.national'),
      override: true,
    };
  }
);

const getBreakByOptions = createSelector([getTranslate], (t) => {
  const options = t('pages.emissions-portal.ghg-emission-inventory.break-by', {
    default: {},
  });
  return Object.keys(options).map((optionKey) => ({
    label: options[optionKey],
    value: optionKey,
  }));
});

const getFieldOptions = (field) =>
  createSelector(
    [getMetadataData, getNationalOption, getFieldQuery('breakBy'), getAllSelectedOption],
    (metadata, nationalOption, queryBreakBy, allSelectedOption) => {
      if (!metadata || !metadata[field]) return null;

      const breakBySelected = queryBreakBy || DEFAULTS.breakBy;
      const isAbsoluteMetric = breakBySelected.includes('absolute');
      const isBrekBySector = breakBySelected.includes('sector')

      const transformToOption = (o) => ({
        label: o.label,
        value: String(o.value),
        code: o.iso_code3 || o.code || o.label,
        override: o.override,
      });

      let options = metadata[field];

      switch (field) {
        case 'sector': {
          if (isAbsoluteMetric) {
            options = options.filter((o) => o.code !== SECTOR_TOTAL);
            if (isBrekBySector) {
              options = [ allSelectedOption, ...options]
            }
          } break;
        }
        case 'location': {
          options = options.filter((o) => o.iso_code3 !== COUNTRY_ISO);
          options = [...options, nationalOption];
          break;
        }
        default:
      }

      return options.filter((o) => o).map(transformToOption);
    }
  );

// SELECTED
const getFieldSelected = (field) =>
  createSelector(
    [getFieldQuery(field), getDefaults, getFilterOptions, getAllSelectedOption],
    (queryValue, defaults, options, allSelectedOption) => {
      if (!queryValue) return defaults[field];
      if (queryValue === ALL_SELECTED) return allSelectedOption;
      const findSelectedOption = (value) => findOption(options[field], value);
      return queryValue.includes(',')
        ? queryValue.split(',').map((v) => findSelectedOption(v))
        : findSelectedOption(queryValue);
    }
  );

export const getFilterOptions = createStructuredSelector({
  source: () => SOURCE_OPTIONS,
  breakBy: getBreakByOptions,
  region: getFieldOptions('location'),
  sector: getFieldOptions('sector'),
  category: getFieldOptions('category'),
  subCategory: getFieldOptions('subCategory'),
  gas: getFieldOptions('gas'),
  chartType: () => CHART_TYPE_OPTIONS,
});

// DEFAULTS
const getDefaults = createSelector(
  [getFilterOptions, getFieldQuery('breakBy')],
  (options, breakBy) => {
    return {
      source: findOption(SOURCE_OPTIONS, DEFAULTS.source),
      chartType: findOption(CHART_TYPE_OPTIONS, DEFAULTS.chartType),
      breakBy: findOption(options.breakBy, DEFAULTS.breakBy),
      region: findOption(options.region, DEFAULTS.region),
      sector: get(options, 'sector[0]'),
      gas: findOption(options.gas, DEFAULTS.gas),
      category: findOption(options.category, DEFAULTS.category),
      subCategory: findOption(options.subCategory, DEFAULTS.subCategory),
    }
  }
)

const filterSectorSelectedByMetrics = createSelector(
  [
    getFieldSelected('sector'),
    getFieldOptions('sector'),
    getFieldSelected('breakBy'),
  ],
  (sectorSelected, sectorOptions, breakBy) => {
    if (!sectorOptions || !breakBy) return null;
    if (!breakBy.value.endsWith('absolute')) {
      return (
        sectorOptions.find((o) => o.code === SECTOR_TOTAL) || sectorSelected
      );
    }

    if (sectorSelected.value === ALL_SELECTED) {
      return sectorOptions.filter(o => o.value !== ALL_SELECTED)
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
  category: getFieldSelected('category'),
  subCategory: getFieldSelected('subCategory'),
  gas: getFieldSelected('gas'),
});

const getBreakBySelected = createSelector(getSelectedOptions, (options) => {
  if (!options || !options.breakBy) return null;
  const breakByArray = options.breakBy.value.split('-');
  return { modelSelected: breakByArray[0], metricSelected: breakByArray[1] };
});

export const getModelSelected = createSelector(
  getBreakBySelected,
  (breakBySelected) =>
    (breakBySelected && breakBySelected.modelSelected) || null
);
export const getMetricSelected = createSelector(
  getBreakBySelected,
  (breakBySelected) =>
    (breakBySelected && breakBySelected.metricSelected) || null
);
