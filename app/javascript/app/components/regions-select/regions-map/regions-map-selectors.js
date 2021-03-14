import { createSelector } from 'reselect';
import flatten from 'lodash/flatten';
import { scaleQuantile } from 'd3-scale';

import { getProvince, getLocations } from 'selectors/provinces-selectors';
import { METRIC } from 'constants';

import indonesiaPaths from 'utils/maps/indonesia-paths';
import { getTranslate } from 'selectors/translation-selectors';

const DEFAULT_MAP_CENTER = [ 118, -1.86 ];
const MAP_BUCKET_COLORS = [
  '#FFFFFF',
  '#B3DDF8',
  '#3AA2E0',
  '#297CB8',
  '#064584'
];

const countryStyles = {
  default: {
    fill: '#e5e5eb',
    fillOpacity: 1,
    stroke: '#ffffff',
    strokeWidth: 0.1,
    outline: 'none'
  },
  hover: {
    fill: '#ffd771',
    stroke: '#ffffff',
    strokeWidth: 0.1,
    outline: 'none'
  },
  pressed: {
    fill: '#ffc735',
    stroke: '#ffffff',
    strokeWidth: 0.2,
    outline: 'none'
  }
};

const PBStyles = {
  ...countryStyles,
  default: { ...countryStyles.default, fill: '#009900', fillOpacity: 1 }
};

const activeStyles = {
  ...countryStyles,
  default: { ...countryStyles.default, fill: '#ffc735', fillOpacity: 1 }
};

const hoverRegionStyles = {
  ...countryStyles,
  default: { ...countryStyles.default, fill: '#ffd771', fillOpacity: 1 }
};

const getHoverRegion = (state, props) => props.hoverRegion;

const getMapStyles = color => ({
  default: {
    fill: color,
    fillOpacity: 1,
    stroke: '#ffffff',
    strokeWidth: 0.2,
    outline: 'none'
  },
  hover: { fill: color, stroke: '#ffffff', strokeWidth: 0.6, outline: 'none' },
  pressed: { fill: color, stroke: '#ffffff', strokeWidth: 0.2, outline: 'none' }
});

const composeBuckets = bucketValues => {
  const buckets = [];

  bucketValues
    .map(v => Math.round(v))
    .concat([ null ])
    .reduce(
      (prev, curr, index) => {
        buckets.push({
          minValue: prev,
          maxValue: curr,
          color: MAP_BUCKET_COLORS[index]
        });
        return curr;
      },
      null
    );

  return buckets;
};

const createBucketColorScale = emissions => {
  const totalEmissionsByProvinceYear = emissions.reduce(
    (acc, e) => {
      const key = `${e.provinceISO}_${e.year}`;
      return { ...acc, [key]: (acc[key] || 0) + e.value };
    },
    {}
  );

  const allEmissionValuesRounded = Object
    .keys(totalEmissionsByProvinceYear)
    .map(key => Math.round(totalEmissionsByProvinceYear[key]));

  return scaleQuantile()
    .domain(allEmissionValuesRounded)
    .range(MAP_BUCKET_COLORS);
};

export const getMap = createSelector(
  [ getProvince, getTranslate, getLocations, getHoverRegion ],
  (provinceISO, t, provincesDetails, hoverRegion) => {
    const region = hoverRegion;
    const paths = [];
    const byProvinceISO = path =>
      (path.properties && path.properties.code_hasc) === provinceISO;
    const provincePath = indonesiaPaths.find(byProvinceISO);
    const mapCenter = DEFAULT_MAP_CENTER;

    indonesiaPaths.forEach(path => {
      const iso = path.properties && path.properties.code_hasc;
      const isEqual = iso === 'ID.PB';
      const isActive = iso === provinceISO;
      if (isEqual) {
        return paths.push({ ...path, style: PBStyles });
      }

      if (isActive) {
        return paths.push({ ...path, style: activeStyles });
      }

      const isHover = iso === region;
      if (isHover) {
        return paths.push({ ...path, style: hoverRegionStyles });
      }

      const { geometry, properties, type } = path;
      const provinceProperties = provincesDetails.length > 0 &&
        provincesDetails.find(p => p.iso_code3 === iso);
      const provinceName = provinceProperties
        ? provinceProperties.wri_standard_name
        : properties.name;

      paths.push({
        type,
        geometry,
        properties: { ...properties, name: provinceName },
        style: countryStyles
      });
    });

    return { paths, mapCenter, region };
  }
);
