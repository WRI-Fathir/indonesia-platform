import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';

import papuaPaths from 'utils/maps/papua-barat-paths';
import { getTranslate } from 'selectors/translation-selectors';

import { ALL_SELECTED } from 'constants/constants'

import {
  getIndicatorPopulation,
  getSelectedOptions
} from '../region-population-selectors';

const getMapStyles = color => ({
  default: {
    fill: color,
    fillOpacity: 1,
    stroke: '#ffffff',
    strokeWidth: 0.05,
    outline: 'none'
  },
  hover: { fill: '#fff3d4', stroke: '#ffffff', strokeWidth: 0.08, outline: 'none' },
  pressed: { fill: color, stroke: '#ffffff', strokeWidth: 0.1, outline: 'none' }
});

export const getMap = createSelector(
  [
    getIndicatorPopulation,
    getSelectedOptions
  ],
  (
    indicators,
    options,
  ) =>
    {
      if (isEmpty(indicators)) return {}
      const paths = []
      const selectedDistrict = options.district.value

      let mapCenter = [132.825, -1.32525]

      if (selectedDistrict !== ALL_SELECTED) {
        const findDistrict = papuaPaths.find(path => path.properties.iso_code3 === selectedDistrict)
        const lon = findDistrict.properties.longitude
        const lat = findDistrict.properties.latitude
        mapCenter = [lon, lat]
      }

      papuaPaths.forEach(path => {
        const district = path.properties && path.properties.wri_std_na;
        const { geometry, properties, type } = path;

        paths.push({
          type,
          geometry,
          properties: { ...properties, name: district },
          style: getMapStyles('#ffc735')
        });
      });
      return { paths, selectedOptions: options, mapCenter }
    }
);
