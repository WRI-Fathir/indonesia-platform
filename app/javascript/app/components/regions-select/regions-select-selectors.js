import { createStructuredSelector, createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { getProvince } from 'selectors/provinces-selectors';
import { METRIC } from 'constants';
import indonesiaPaths from 'utils/maps/indonesia-paths';
import { getTranslate } from 'selectors/translation-selectors';

const DEFAULT_SECTION = 'regions-ghg-emissions';

const getProvinces = ({ provinces }) => provinces && provinces.data || null;
const getLocation = ({ location }) => location && location;

const getSection = createSelector(getLocation, location => {
  if (!location) return null;

  return get(location, 'payload.region')
    ? get(location, 'payload.section')
    : '';
});

const getParsedProvinces = createSelector([ getProvinces, getSection ], (
  provinces,
  section
) =>
  {
    if (!provinces || isEmpty(provinces)) return [];

    const provinceSection = section || DEFAULT_SECTION;
    const sortedProvince = provinces.sort((a, b) => {
      var nameA = a.wri_standard_name.toUpperCase() 
      var nameB = b.wri_standard_name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    })

    return sortedProvince.map(province => ({
      value: province.iso_code3,
      label: province.wri_standard_name,
      path: `/regions/${province.iso_code3}/${provinceSection}`
    }));
  });

export const getProvincesData = createStructuredSelector({
  provinces: getParsedProvinces,
  activeProvince: getProvince
});
