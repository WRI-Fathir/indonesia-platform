/*
  filename: emission-map-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import indonesiaPaths from 'utils/maps/indonesia-paths';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import isUndefined from 'lodash/isUndefined';
import { scaleThreshold } from 'd3-scale';
import { getTranslate } from 'selectors/translation-selectors';
import { getLocations } from 'selectors/provinces-selectors';
import { SOURCE } from 'constants';
import {
  NO_DATA,
  EMISSIONS_UNIT,
  EMISSIONS_UNIT_NO_HTML,
  SECTION_COLORS,
  getMapStyles
} from './emission-map-constants';


import {
  getMetadataData,
  getGHGEmissionData
} from './emission-map-redux-selectors';

const MAP_BUCKET_COLORS_2 = {
  'ENERGY': [
    '#fff6e4',
    '#fff6e4',
    '#fed886',
    '#feca5c',
    '#fdbb2d'
  ],
  'IPPU': [
    '#ffe1e8',
    '#ffb1c3',
    '#ff829f',
    '#ff547c',
    '#ff2a5c'
  ],
  'FORESTRY': [
    '#dbe7df',
    '#afcab8',
    '#7eaa8d',
    '#528d67',
    '#32784b',
    '#00571e'
  ],
  'WASTE': [
    '#d4eafe',
    '#a1d1fd',
    '#74bbfc',
    '#45a4fa',
    '#1b90f9'
  ],
  'AGRICULTURE': [
    '#ffead9',
    '#ffd5b2',
    '#ffbf8a',
    '#ffa960',
    '#ff8d2d'
  ]
}

const { COUNTRY_ISO } = process.env;
const GAS = 'CO2EQ'

const createBucketColorScale = (thresholds, sector) =>
  scaleThreshold().domain(thresholds).range(MAP_BUCKET_COLORS_2[sector]);


const composeBuckets = (bucketValues, sector) => {
  const buckets = [];
  const colorBySector = MAP_BUCKET_COLORS_2[sector]

  bucketValues
    .map(v => Math.round(v))
    // .concat([ null ])
    .reduce(
      (prev, curr, index) => {
        let range = '';
        if (!prev && curr) return curr;

        if (prev && curr) {
          range = `${prev.toLocaleString()} to ${curr.toLocaleString()}`;

        } else {
          range = `${curr.toLocaleString()}`;
        }

        buckets.push({
          name: `${range} ${EMISSIONS_UNIT_NO_HTML}`,
          color: colorBySector[index]
        });
        return curr;
      },
      null
    );

  return buckets;
};

const getLocalizedProvinceName = ({ code_hasc, name }, provincesDetails) => {
  const provinceProperties = !isEmpty(provincesDetails) &&
    provincesDetails.find(p => p.iso_code3 === code_hasc);
  return provinceProperties ? provinceProperties.wri_standard_name : name;
};

const getMapLoading = ({ GHGEmissions = {} }) =>
  (GHGEmissions && GHGEmissions.loading);

const getFieldSelected = field => state => {
  const { query } = state.location;
  if (!query || !query[field]) {
    if (field === 'sector') {
      return 'ENERGY';
    }

    if (field === 'year') {
      return 2000;
    }
  }
  const queryValue = query[field];
  return queryValue;
  // const options = getFilterOptions(state)[field];
  // return options && options.find(o => o.value === queryValue);
};

const getSelectedOptions = createStructuredSelector({
  sector: getFieldSelected('sector'),
  year: getFieldSelected('year')
});

const getSelectedYear = createSelector(
  [ getSelectedOptions ],
  selectedOptions => selectedOptions ? selectedOptions.year : null
);

const getSelectedSector = createSelector(
  [ getSelectedOptions ],
  selectedOptions => {
    if (!selectedOptions) return null;
    return selectedOptions.sector;
  }
);

const getSectors = createSelector([ getMetadataData ], meta => {
  if (!meta || !meta.sector) return [];
  return meta.sector;
});

const getYears = createSelector([ getGHGEmissionData ], emissionData => {
  if (!emissionData) return null;
  return emissionData &&
    emissionData[0] &&
    emissionData[0].emissions.map(e => e.year);
});

const getEmissionDataSource = createSelector([ getMetadataData ], meta => {
  if (!meta || !meta.dataSource) return null;
  const selected = meta.dataSource.find(
    source => source.label === SOURCE.SIGN_SMART
  );
  return selected && selected.value;
});

const getEmissions = createSelector([ getGHGEmissionData, getSelectedSector],
  (emissionData, selectedSector) => {
    const filteredEmissionData = filter(emissionData, { sector: selectedSector, gas: GAS });

    if (!filteredEmissionData) return null;
    return filteredEmissionData;
  });

const getThresholds = createSelector(
  [ getSelectedSector ], sector => {
    if (!sector) return null

    switch (sector) {
      case 'ENERGY':
        return [1, 501, 1001, 10001, 100001]
      case 'FORESTRY':
        return [-100001, -1001, 1, 100001, 500001]
      default:
        return [1, 501, 1001, 10001, 50001]
    }
  }
)

const getPathsForEmissionStyles = createSelector(
  [ getEmissions, getTranslate, getLocations, getSelectedYear, getYears, getThresholds, getSelectedSector ],
  (emissions, t, provincesDetails, selectedYear, years, thresholds, sector) => {
    if (!emissions || isEmpty(emissions)) return null;
    const paths = [];
    let legend = [];

    indonesiaPaths.forEach((path) => {
      const iso = path.properties && path.properties.code_hasc;
      const selectedData = emissions.find(e => e.iso_code3 === iso)
      let selectedValue = null;

      if (!isUndefined(selectedData)) {
        selectedValue = selectedData.emissions.find(data => data.year === parseInt(selectedYear, 10)).value;
      }

      if (selectedValue) {
        const sectorName = !isEmpty(emissions) && emissions[0].sector;
        const { properties } = path;
        const enhancedPaths = {
          ...path,
          properties: {
            ...properties,
            selectedYear: selectedYear && selectedYear,
            sector: sectorName,
            tooltipValue: selectedValue,
            tooltipUnit: EMISSIONS_UNIT,
            name: getLocalizedProvinceName(properties, provincesDetails)
          }
        };
        const bucketColorScale = createBucketColorScale(thresholds, sector);
        legend = composeBuckets(bucketColorScale.domain(), sector);
        const color = bucketColorScale(selectedValue);
        paths.push({ ...enhancedPaths, style: getMapStyles(color) });
      } else {
        const { properties } = path;
        paths.push({
          ...path,
          style: getMapStyles(SECTION_COLORS[NO_DATA]),
          properties: {
            ...properties,
            name: getLocalizedProvinceName(properties, provincesDetails)
          }
        });
      }
    });

    legend.push({
      name: t('pages.national-context.sectoral-activity.legend-no-data'),
      color: SECTION_COLORS[NO_DATA]
    });

    return { paths, legend };
  }
);

export const getEmissionParams = createSelector(
  [ getEmissionDataSource, getMetadataData],
  (source, meta) => {
    if (!source) return null;
    const category = meta.category.find(element => element.code === `TOTAL`).id
    const gas = meta.gas.find(element => element.code === GAS).id
    return { location: COUNTRY_ISO, source, category, gas };
  }
);

export const getEmissionMap = createStructuredSelector({
  t: getTranslate,
  emissionParams: getEmissionParams,
  sectors: getSectors,
  emission: getEmissions,
  map: getPathsForEmissionStyles,
  selectedOptions: getSelectedOptions,
  years: getYears,
  mapLoading: getMapLoading
});
