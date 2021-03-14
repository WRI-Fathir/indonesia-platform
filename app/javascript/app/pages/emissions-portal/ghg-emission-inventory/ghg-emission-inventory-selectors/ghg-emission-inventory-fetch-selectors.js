import isArray from 'lodash/isArray';
import { createSelector } from 'reselect';
import { ALL_SELECTED } from 'constants/constants';
import { findOption } from 'selectors/filters-selectors';
import { getSelectedOptions } from './ghg-emission-inventory-filter-selectors';

import { getMetadataData } from './ghg-emission-inventory-get-selectors';

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
    const { source: selectedSource, gas, sector, category, subCategory } = options;
    return {
      api: selectedSource.api,
      location: COUNTRY_ISO,
      ...getParam('gas', gas),
      source: findOption(metadata.dataSource, selectedSource.value).value,
      ...getParam('sector', sector),
      ...getParam('category', category),
      ...getParam('subCategory', subCategory)
    };
  }
);

export const getMetaParams = createSelector(
  [ getSelectedOptions, getMetadataData ],
  (options, metadata) => {
    if (!options || !options.category || !options.sector || !metadata) {
      return { meta: 'ghgindo', inventory: true };
    }

    const { sector, category } = options;
    return {
      meta: 'ghgindo',
      inventory: true,
      ...getParam('sector', sector),
      ...getParam('category', category)
    };
  }
);
