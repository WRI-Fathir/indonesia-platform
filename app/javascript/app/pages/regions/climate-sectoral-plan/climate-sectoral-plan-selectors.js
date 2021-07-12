/*
  filename: climate-sectoral-plan-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import { getProvince } from 'selectors/provinces-selectors';
import { getTranslate } from 'selectors/translation-selectors';
import {
  getDevelopmentPlansData
} from './development-plans/development-plans-selectors';

const DEFAULT_OPTION = 'development-plans';

const getQuery = ({ location }) => location && (location.query || null);

const getSelectedOption = createSelector(getQuery, query => {
  if (!query || !query.plans) return DEFAULT_OPTION;
  return query.plans;
});

export const getClimateSectoralPlanData = createStructuredSelector({
  t: getTranslate,
  provinceIso: getProvince,
  query: getQuery,
  selectedOption: getSelectedOption
});
