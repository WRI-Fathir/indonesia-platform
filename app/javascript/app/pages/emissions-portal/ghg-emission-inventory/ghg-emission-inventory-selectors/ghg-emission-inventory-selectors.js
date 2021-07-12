/*
  filename: ghg-emission-inventory-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector } from 'reselect';
import { getTranslate } from 'selectors/translation-selectors';
import { getQuery } from 'selectors/filters-selectors';
import {
  getSelectedOptions,
  getFilterOptions,
  getModelSelected,
  getMetricSelected
} from './ghg-emission-inventory-filter-selectors';
import {
  getEmissionParams,
  getMetaParams
} from './ghg-emission-inventory-fetch-selectors';
import {
  getChartData,
  getMetadataSources,
  getDownloadURI
} from './ghg-emission-inventory-data-selectors';
import { getSelectedAPI } from './ghg-emission-inventory-get-selectors';

export const getGHGEmissions = createStructuredSelector({
  selectedOptions: getSelectedOptions,
  fieldToBreakBy: getModelSelected,
  metricSelected: getMetricSelected,
  apiSelected: getSelectedAPI,
  metadataSources: getMetadataSources,
  downloadURI: getDownloadURI,
  filterOptions: getFilterOptions,
  query: getQuery,
  emissionParams: getEmissionParams,
  metaParams: getMetaParams,
  chartData: getChartData,
  t: getTranslate
});
