/*
  filename: climate-plans-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import { createTextSearchSelector } from 'selectors/util-selectors';
import { getProvince } from 'selectors/provinces-selectors';

export const getSectionsContent = ({ SectionsContent }) =>
  SectionsContent && SectionsContent.data;

const getQuery = ({ location }) => location && (location.query || null);

const getClimatePlansData = ({ climatePlans }) =>
  climatePlans && climatePlans.data;

const getSearch = createSelector(getQuery, query => {
  if (!query || !query.search) return null;
  return query.search;
});

export const getClimatePlans = createStructuredSelector({
  data: createTextSearchSelector(getClimatePlansData, getSearch),
  provinceIso: getProvince
});
