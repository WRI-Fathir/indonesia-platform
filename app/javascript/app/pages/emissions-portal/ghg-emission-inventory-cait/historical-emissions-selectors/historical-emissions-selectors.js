import { createStructuredSelector } from 'reselect';
import { getTranslate } from 'selectors/translation-selectors';
import { getQuery } from 'selectors/filters-selectors';
import {
  getSelectedOptions,
  getFilterOptions,
  getModelSelected,
  getMetricSelected
} from './historical-emissions-filter-selectors';
import { getEmissionParams } from './historical-emissions-fetch-selectors';
import {
  getChartData,
  getMetadataSources,
  getDownloadURI
} from './historical-emissions-data-selectors';
import { getSelectedAPI } from './historical-emissions-get-selectors';

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
  chartData: getChartData,
  t: getTranslate
});
