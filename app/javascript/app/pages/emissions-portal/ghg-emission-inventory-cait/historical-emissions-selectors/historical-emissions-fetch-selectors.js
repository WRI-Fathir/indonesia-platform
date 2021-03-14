import isArray from 'lodash/isArray';
import { createSelector } from 'reselect';
import { ALL_SELECTED } from 'constants/constants';
import { findOption } from 'selectors/filters-selectors';
import { getSelectedOptions } from './historical-emissions-filter-selectors';

import { getMetadataData } from './historical-emissions-get-selectors';

const { COUNTRY_ISO } = process.env;

const getParam = (fieldName, data) => {
  if (!data) return {};
  if (!isArray(data) && data.value !== ALL_SELECTED)
    return { [fieldName]: data.value };
  if (isArray(data)) return { [fieldName]: data.map(f => f.value).join() };
  return {};
};

export const getEmissionParams = createSelector(
  [ getSelectedOptions, getMetadataData ],
  (options, metadata) => {
    if (!options || !options.source || !metadata) return null;
    const { source: selectedSource, gas } = options;
    return {
      api: selectedSource.api,
      location: COUNTRY_ISO,
      ...getParam('gas', gas),
      source: findOption(metadata.dataSource, selectedSource.label).value
    };
  }
);
