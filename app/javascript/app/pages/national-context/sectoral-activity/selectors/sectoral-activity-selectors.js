/*
  filename: sectoral-activity-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import indonesiaPaths from 'utils/maps/indonesia-paths';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import groupBy from 'lodash/groupBy';
import toLower from 'lodash/toLower';
import startCase from 'lodash/startCase';
import capitalize from 'lodash/capitalize';
import isEmpty from 'lodash/isEmpty';
import { scaleThreshold } from 'd3-scale';

import { getTranslate } from 'selectors/translation-selectors';
import { getLocations } from 'selectors/provinces-selectors';
import { METRIC, SOURCE, SECTOR_TOTAL } from 'constants';
import {
  NO_DATA,
  ADAPTATION_CODE,
  EMISSIONS_UNIT,
  EMISSIONS_UNIT_NO_HTML,
  PRIMARY_SOURCE_OF_EMISSION_INDICATOR,
  SECTION_COLORS,
  YES_NO_COLORS,
  MAP_BUCKET_COLORS,
  ISOS_NOT_ALLOWED,
  LOCATION_ISO_CODE,
  getMapStyles
} from './sectoral-activity-constants';

import {
  isPrimarySourceOfEmissionSelected,
  isAdaptationSelected,
  isActivitySelectable
} from './sectoral-activity-abilities';

import {
  getAdaptation,
  getEmissionActivities,
  getMetadataData,
  getGHGEmissionData,
  getQuery
} from './sectoral-activity-redux-selectors';

const { COUNTRY_ISO } = process.env;

const createBucketColorScale = thresholds =>
  scaleThreshold().domain(thresholds).range(MAP_BUCKET_COLORS);

const composeBuckets = bucketValues => {
  const buckets = [];

  bucketValues
    .map(v => Math.round(v))
    .concat([ null ])
    .reduce(
      (prev, curr, index) => {
        let range = '';
        if (prev && curr) {
          range = `${prev}-${curr}`;
        } else {
          range = prev ? `>${prev}` : `0-${curr}`;
        }
        buckets.push({
          name: `${range} ${EMISSIONS_UNIT_NO_HTML}`,
          color: MAP_BUCKET_COLORS[index]
        });
        return curr;
      },
      null
    );

  return buckets;
};

const getEmissionDataSource = createSelector(getMetadataData, meta => {
  if (!meta || !meta.dataSource) return null;
  const selected = meta.dataSource.find(
    source => source.label === SOURCE.SIGN_SMART
  );
  return selected && selected.value;
});

const getLocalizedProvinceName = ({ code_hasc, name }, provincesDetails) => {
  const provinceProperties = provincesDetails.find(
    p => p.iso_code3 === code_hasc
  );
  return provinceProperties ? provinceProperties.wri_standard_name : name;
};

const getAdaptationParams = () => ({ code: ADAPTATION_CODE });

const getAdaptationIndicator = createSelector([ getAdaptation ], adaptation => {
  if (!adaptation) return null;

  return adaptation.indicators &&
    adaptation.indicators.find(i => i.code === ADAPTATION_CODE);
});

const getSectors = createSelector(
  [ getEmissionActivities ],
  emissionActivities => {
    if (!emissionActivities) return null;

    return uniqBy(
      emissionActivities,
      'sector_code'
    ).map(em => ({ name: em.sector, code: em.sector_code }));
  }
);

const getYears = createSelector(
  [ getEmissionActivities ],
  emissionActivities => {
    if (!emissionActivities) return null;
    return emissionActivities &&
      emissionActivities[0] &&
      emissionActivities[0].emissions.map(e => e.year);
  }
);

const getIndicatorsOptions = createSelector(
  [ getSectors, getAdaptationIndicator, getTranslate ],
  (sectors, adaptationIndicator, t) => {
    if (!sectors || !adaptationIndicator) return null;

    const apiIndicators = sectors.map(s => ({ label: s.name, value: s.code }));
    const adaptationIndicatorOption = {
      label: adaptationIndicator.name,
      value: adaptationIndicator.code
    };
    const primarySourceIndicatorOption = {
      label: t(
        `pages.national-context.sectoral-activity.${PRIMARY_SOURCE_OF_EMISSION_INDICATOR}`
      ),
      value: PRIMARY_SOURCE_OF_EMISSION_INDICATOR
    };

    apiIndicators.push(primarySourceIndicatorOption);
    apiIndicators.push(adaptationIndicatorOption);

    return sortBy(apiIndicators, 'label');
  }
);

const getYearsOptions = createSelector([ getYears ], years => {
  if (!years) return null;

  return years.map(y => ({ label: y.toString(), value: y.toString() }));
});

const getFilterOptions = createStructuredSelector({
  indicator: getIndicatorsOptions,
  year: getYearsOptions
});

const getDefaults = createSelector(getFilterOptions, options => ({
  indicator: options &&
    options.indicator &&
    options.indicator.find(
      o => o.value === PRIMARY_SOURCE_OF_EMISSION_INDICATOR
    ),
  year: options && options.year && options.year[0]
}));

const getFieldSelected = field => state => {
  const { query } = state.location;
  if (!query || !query[field]) return getDefaults(state)[field];
  const queryValue = query[field];
  const options = getFilterOptions(state)[field];

  return options && options.find(o => o.value === queryValue);
};

const getSelectedOptions = createStructuredSelector({
  indicator: getFieldSelected('indicator'),
  year: getFieldSelected('year')
});

const getSelectedYear = createSelector(
  [ getSelectedOptions ],
  selectedOptions => selectedOptions ? selectedOptions.year : null
);

const getSelectedIndicator = createSelector(
  [ getSelectedOptions ],
  selectedOptions => selectedOptions ? selectedOptions.indicator : null
);

const getActivityOptions = createSelector(
  [ getEmissionActivities, getSelectedIndicator ],
  (emissionActivities, selectedIndicator) => {
    if (isEmpty(emissionActivities) || !selectedIndicator) return [];

    const sectorCode = selectedIndicator.value;
    const emissionsBySector = emissionActivities &&
      emissionActivities.filter(e => e.sector_code === sectorCode);

    const activities = emissionsBySector.length &&
      emissionsBySector.map(e => e.activity) ||
      [];
    const uniqueActivities = activities.length && [ ...new Set(activities) ] ||
      [];

    return uniqueActivities.map(activity => ({
      label: capitalize(toLower(startCase(activity))),
      value: activity
    }));
  }
);

const getSelectedActivity = createSelector([ getQuery, getActivityOptions ], (
  query,
  activityOptions
) =>
  {
    if (!activityOptions) return null;
    if (!query || !query.activity) return activityOptions[0];
    const queryValue = query.activity;

    return activityOptions && activityOptions.find(o => o.value === queryValue);
  });

const getFilteredEmissionData = createSelector(
  [ getGHGEmissionData ],
  ghgEmissionData => {
    if (!ghgEmissionData || !ghgEmissionData.length) return null;

    const getSectorCode = d =>
      d.sector === 'IPPU' ? 'INDUSTRIAL_PROCESS_AND_PRODUCT_USE' : d.sector;

    return ghgEmissionData
      .filter(d => d.sector !== SECTOR_TOTAL && d.metric === METRIC.absolute)
      .map(d => ({
        ...d,
        sector_code: getSectorCode(d),
        [LOCATION_ISO_CODE]: d.iso_code3
      }));
  }
);

const getProvincesData = createSelector(
  [
    getFilteredEmissionData,
    getEmissionActivities,
    getSelectedOptions,
    getAdaptation
  ],
  (ghgEmissionData, emissionActivities, selectedOptions, adaptation) => {
    if (
      !ghgEmissionData || !emissionActivities || !selectedOptions || !adaptation
    )
      return null;

    const selectedIndicator = selectedOptions.indicator;

    let filteredData = [];

    if (isPrimarySourceOfEmissionSelected(selectedIndicator)) {
      filteredData = ghgEmissionData;
    } else if (isAdaptationSelected(selectedIndicator)) {
      filteredData = adaptation.values &&
        adaptation.values.filter(o => o.indicator_code === ADAPTATION_CODE);
    } else {
      filteredData = isArray(emissionActivities) &&
        selectedIndicator &&
        emissionActivities.filter(
          emissionData => emissionData.sector_code === selectedIndicator.value
        );
    }

    return { data: filteredData };
  }
);

const getParsedDataForAdaptation = createSelector(
  [ getAdaptation, getSelectedOptions ],
  (adaptationData, selectedOptions) => {
    if (!adaptationData || !selectedOptions) return null;

    const provincesData = adaptationData.values &&
      adaptationData.values.filter(o => o.indicator_code === ADAPTATION_CODE);

    const groupedByProvince = provincesData &&
      groupBy(provincesData, LOCATION_ISO_CODE);

    const map = {};
    if (groupedByProvince) {
      Object.keys(groupedByProvince).forEach(province => {
        map[province] = get(groupedByProvince[province], '[0].values[0].value');
      });
    }

    return map;
  }
);

const getPathsWithStylesForAdaptationSelector = createSelector(
  [ getParsedDataForAdaptation, getTranslate, getLocations ],
  (parsedDataForAdaptation, t, provincesDetails) => {
    if (!parsedDataForAdaptation) return null;

    const paths = [];
    let legend = [];

    indonesiaPaths.forEach(path => {
      const iso = path.properties && path.properties.code_hasc;
      const province = parsedDataForAdaptation[iso];
      if (province) {
        const value = parsedDataForAdaptation[iso];
        const color = YES_NO_COLORS[toLower(value)];

        // Fill the legend
        if (!legend.find(i => i.name === value)) {
          legend.push({ name: value, color });
        }
        const { properties } = path;
        const enhancedPath = {
          ...path,
          properties: {
            ...properties,
            tooltipValue: value,
            name: getLocalizedProvinceName(properties, provincesDetails)
          }
        };
        paths.push({ ...enhancedPath, style: getMapStyles(color) });
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

    legend = sortBy(legend, 'name');
    legend.push({
      name: t('pages.national-context.sectoral-activity.legend-no-data'),
      color: SECTION_COLORS[NO_DATA]
    });

    return { paths, legend };
  }
);

const getIsActivitySelectable = createSelector(
  [ getSelectedIndicator ],
  selectedIndicator => {
    if (!selectedIndicator) return false;

    return isActivitySelectable(selectedIndicator);
  }
);

const getGroupedData = createSelector(
  [ getProvincesData, getSelectedOptions, getSectors ],
  (provincesData, selectedOptions, sectors) => {
    if (!provincesData || !selectedOptions || !sectors) return null;

    const groupedByProvince = provincesData &&
      groupBy(provincesData.data, LOCATION_ISO_CODE);

    const provinceKeys = Object
      .keys(groupedByProvince)
      .filter(province => !ISOS_NOT_ALLOWED.includes(province));
    const provinces = {};
    if (provinceKeys) {
      provinceKeys.forEach(key => {
        provinces[key] = groupBy(groupedByProvince[key], 'sector_code');
      });
    }

    return provinces;
  }
);

const getParsedDataForActivities = (
  groupedData,
  selectedYear,
  selectedIndicator,
  selectedActivity
) =>
  {
    const chosenSector = selectedIndicator.value;
    const bySelectedYear = e => e.year === parseInt(selectedYear.value, 10);
    const provinces = Object.keys(groupedData);

    const emissions = {};

    provinces.forEach(province => {
      const emissionsByActivities = groupBy(
        groupedData[province][chosenSector],
        'activity'
      );

      const emissionsBySelectedActivity = selectedActivity &&
        get(emissionsByActivities[selectedActivity.value], '[0].emissions');
      const emissionsByYear = emissionsBySelectedActivity &&
        emissionsBySelectedActivity.find(bySelectedYear);
      emissions[province] = get(emissionsByYear, 'value') || null;
    });
    return emissions;
  };

const getParsedDataForSectors = (groupedData, selectedYear) => {
  const bySelectedYear = e => e.year === parseInt(selectedYear.value, 10);
  const provinces = Object.keys(groupedData);
  const emissions = {};

  // total emissions for province and sector
  provinces.forEach(province => {
    const sectors = Object.keys(groupedData[province]);
    const totalEmissionForSector = sector => groupedData[province][sector]
      .reduce((acc, o) => acc.concat(o.emissions), [])
      .filter(bySelectedYear)
      .reduce((sum, emission) => sum + emission.value, 0);

    emissions[province] = sectors.reduce(
      (acc, sector) => ({ ...acc, [sector]: totalEmissionForSector(sector) }),
      {}
    );
  });

  return emissions;
};

const getEmissions = createSelector(
  [
    getGroupedData,
    getSelectedYear,
    getSelectedIndicator,
    getSelectedActivity
  ],
  (groupedData, selectedYear, selectedIndicator, selectedActivity) => {
    if (!groupedData || !selectedYear || !selectedIndicator) return null;
    if (isAdaptationSelected(selectedIndicator)) return {};

    if (isActivitySelectable(selectedIndicator)) {
      return getParsedDataForActivities(
        groupedData,
        selectedYear,
        selectedIndicator,
        selectedActivity
      );
    }

    return getParsedDataForSectors(groupedData, selectedYear);
  }
);

const getPathsForActivitiesStyles = createSelector(
  [
    getEmissions,
    getSelectedActivity,
    getTranslate,
    getSelectedYear,
    getLocations
  ],
  (emissions, activity, t, selectedYear, provincesDetails) => {
    if (!emissions || !selectedYear) return null;

    const paths = [];
    let legend = [];

    indonesiaPaths.forEach(path => {
      const iso = path.properties && path.properties.code_hasc;
      const value = emissions[iso];

      if (value) {
        const activityName = get(activity, 'label');
        const { properties } = path;
        const enhancedPaths = {
          ...path,
          properties: {
            ...properties,
            selectedYear: selectedYear && selectedYear.value,
            sector: activityName,
            tooltipValue: value,
            tooltipUnit: EMISSIONS_UNIT,
            name: getLocalizedProvinceName(properties, provincesDetails)
          }
        };

        const thresholds = [ 10, 100, 500, 1000 ];
        const bucketColorScale = createBucketColorScale(thresholds);
        legend = composeBuckets(bucketColorScale.domain());
        const color = bucketColorScale(value);

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

const getPathsWithStylesSelector = createSelector(
  [
    getEmissions,
    getSelectedIndicator,
    getSelectedYear,
    getSectors,
    getTranslate,
    getLocations
  ],
  (emissions, selectedIndicator, selectedYear, sectors, t, provincesDetails) =>
    {
      if (!emissions || !selectedIndicator || !selectedYear) return null;

      const getSectorName = sectorCode => {
        const sec = sectors.find(s => s.code === sectorCode);
        return get(sec, 'name', sectorCode);
      };

      const paths = [];
      const legend = [];

      indonesiaPaths.forEach(path => {
        const iso = path.properties && path.properties.code_hasc;
        const emissionsPerSector = emissions[iso] || {};

        const provinceSectors = Object.keys(emissionsPerSector);
        const highestEmissionsSector = provinceSectors.length &&
          provinceSectors.reduce(
            (a, b) => emissionsPerSector[a] > emissionsPerSector[b] ? a : b
          );
        const highestEmissionsValue = emissionsPerSector[highestEmissionsSector];

        if (highestEmissionsValue) {
          const sectorName = capitalize(
            toLower(startCase(getSectorName(highestEmissionsSector)))
          );
          const { properties } = path;
          const enhancedPaths = {
            ...path,
            properties: {
              properties,
              selectedYear: selectedYear && selectedYear.value,
              sector: sectorName,
              tooltipValue: highestEmissionsValue,
              tooltipUnit: EMISSIONS_UNIT,
              name: getLocalizedProvinceName(properties, provincesDetails)
            }
          };

          const color = SECTION_COLORS[highestEmissionsSector];

          if (!legend.find(i => i.name === sectorName)) {
            legend.push({ name: sectorName, color });
          }

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

const getPaths = createSelector(
  [
    getSelectedIndicator,
    getPathsWithStylesForAdaptationSelector,
    getPathsWithStylesSelector,
    getPathsForActivitiesStyles
  ],
  (
    selectedIndicator,
    pathsForAdaptation,
    pathsForEmissions,
    pathsForActivites
  ) =>
    {
      if (!selectedIndicator || !pathsForAdaptation || !pathsForEmissions)
        return { paths: [], legend: [] };

      if (isPrimarySourceOfEmissionSelected(selectedIndicator))
        return pathsForEmissions;
      if (isAdaptationSelected(selectedIndicator)) return pathsForAdaptation;

      return pathsForActivites;
    }
);

const getSources = createSelector([ getAdaptation, getEmissionActivities ], (
  adaptation,
  emissions
) =>
  {
    if (!adaptation || !adaptation.values || !emissions || !emissions.length)
      return [];

    const sources = uniq(emissions.map(e => e.source));

    return sources.concat(
      uniq(
        adaptation.values
          .filter(o => o.indicator_code === ADAPTATION_CODE)
          .map(v => v.source)
      )
    );
  });

export const getEmissionParams = createSelector(
  [ getEmissionDataSource ],
  source => {
    if (!source) return null;
    return { location: COUNTRY_ISO, source };
  }
);

export const getSectoralActivity = createStructuredSelector({
  t: getTranslate,
  options: getFilterOptions,
  activityOptions: getActivityOptions,
  selectedOptions: getSelectedOptions,
  selectedActivity: getSelectedActivity,
  years: getYears,
  query: getQuery,
  map: getPaths,
  adaptationParams: getAdaptationParams,
  emissionParams: getEmissionParams,
  sources: getSources,
  activitySelectable: getIsActivitySelectable,
  adaptationCode: () => ADAPTATION_CODE
});
