/*
  filename: climate-funding-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import trim from 'lodash/trim';
import sortBy from 'lodash/sortBy';
import { getTranslate } from 'selectors/translation-selectors';
import { createTextSearchSelector } from 'selectors/util-selectors';

const getQuery = ({ location }) => location && (location.query || null);
const getData = ({ FundingOportunities }) =>
  FundingOportunities && (FundingOportunities.data || null);

const getSearch = createSelector(getQuery, query => {
  if (!query || !query.search) return null;
  return query.search;
});

export const getLinkableColumnsSchema = createSelector(getData, getTranslate, (
  data,
  t
) =>
  {
    if (isEmpty(data)) return null;
    return data.map(() => [
      {
        columnName: 'website_link',
        url: 'self',
        label: t('pages.national-context.climate-funding.view-more-link')
      }
    ]);
  });

const getSources = createSelector(getData, data => {
  if (isEmpty(data)) return [];
  return uniq(data.map(d => d.source));
});

const getSupports = createSelector(getData, data => {
  if (isEmpty(data)) return [];
  const list = data.map(x => x.mode_of_support)
                   .map(y => y.split(','))
                      
  return sortBy(uniq(flatten(list).map(z => trim(z)))
           .map(x => ({label: x, value: x})), ['value'])
})

const getSectors = createSelector(getData, data => {
  if (isEmpty(data)) return [];

  const list = data.map(x => x.sectors_and_topics)
                   .map(y => y.split(','))
                      
  return sortBy(uniq(flatten(list).map(z => trim(z)))
           .map(x => ({label: x, value: x})), ['value'])
})

export const mapStateToProps = createStructuredSelector({
  data: createTextSearchSelector(getData, getSearch),
  supports: getSupports,
  sectors: getSectors,
  titleLinks: getLinkableColumnsSchema,
  sources: getSources,
  t: getTranslate
});
