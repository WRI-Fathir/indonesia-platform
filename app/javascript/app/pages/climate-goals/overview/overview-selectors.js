/*
  filename: overview-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import groupBy from 'lodash/groupBy';
import { getTranslate } from 'selectors/translation-selectors';

const getOverviewData = ({ ndcContentOverview }) =>
  ndcContentOverview && ndcContentOverview.data;

const getOverviewValues = createSelector(getOverviewData, overview => {
  if (!overview) return null;

  return overview.values;
});

const getOverviewSectors = createSelector(getOverviewData, overview => {
  if (!overview) return null;

  return overview.sectors;
});

const getValuesGrouped = createSelector(getOverviewValues, values => {
  if (!values || !values.length) return null;

  const groupedValues = groupBy(values, 'slug');
  Object.keys(groupedValues).forEach(key => {
    if (!groupedValues[key].length) groupedValues[key] = null;
  });
  return groupedValues;
});

const getNonGhgMitigationCards = createSelector(getTranslate, t => {
  if (!t) return null;
  return [
    {
      title: t('pages.climate-goals.overview.card-non-ghg'),
      type: 'non_ghg_target'
    },
    {
      title: t('pages.climate-goals.overview.card-mitigation-action'),
      type: 'coverage_sectors'
    }
  ];
});

export const getOverview = createStructuredSelector({
  values: getValuesGrouped,
  sectors: getOverviewSectors,
  nonGhgMitigationCards: getNonGhgMitigationCards,
  t: getTranslate
});
