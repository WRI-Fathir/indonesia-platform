import { createStructuredSelector, createSelector } from 'reselect';
import isArray from 'lodash/isArray';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import {
  ALL_SELECTED,
  API,
  API_TARGET_DATA_SCALE,
  METRIC,
  METRIC_OPTIONS,
  SECTOR_TOTAL
} from 'constants';

import {
  DEFAULT_AXES_CONFIG,
  getThemeConfig,
  getYColumnValue,
  getTooltipConfig
} from 'utils/graphs';

import { getTranslate } from 'selectors/translation-selectors';
import { findOption } from 'selectors/filters-selectors';
import {
  getEmissionsData,
  getMetadata,
  getMetadataData,
  getSelectedAPI,
  getTargetEmissionsData,
  getWBData
} from './ghg-emission-inventory-get-selectors';
import {
  getSelectedOptions,
  getFilterOptions,
  getModelSelected,
  getMetricSelected
} from './ghg-emission-inventory-filter-selectors';

const { COUNTRY_ISO } = process.env;
const { CW_API_URL } = process.env;

const FRONTEND_FILTERED_FIELDS = ['region', 'sector', 'category', 'subCategory', 'gas']

const getUnit = createSelector([getMetadataData, getSelectedOptions], (
  meta,
  options,
) =>
  {
    if (!meta || isEmpty(options.gas)) return null;
    const { gas: gases} = meta;
    const gasObject = gases &&
      gases.find(m => options.gas.label === m.label);
    return gasObject.unit
  });

export const getScale = createSelector([ getUnit ], unit => {
  if (!unit) return null;
  if (unit.startsWith('kt')) return 1000;
  if (unit.startsWith('Mt')) return 1000000;
  return 1;
});

const getCorrectedUnit = createSelector([ getUnit ], unit => {
  if (!unit) return null;
  return unit.replace('kt', 't').replace('Mt', 't');
});

const outAllSelectedOption = o => o.value !== ALL_SELECTED;

const getLegendDataOptions = createSelector(
  [ getModelSelected, getFilterOptions ],
  (modelSelected, options) => {
    if (!options || !options[modelSelected]) return null;
    return options[modelSelected].filter(outAllSelectedOption);
  }
);

const getLegendDataSelected = createSelector(
  [ getModelSelected, getSelectedOptions, getFilterOptions ],
  (modelSelected, selectedOptions, options) => {
    if (
      !selectedOptions ||
        !modelSelected ||
        !selectedOptions[modelSelected] ||
        !options
    )
      return null;

    const dataSelected = castArray(selectedOptions[modelSelected]);
    if (isOptionSelected(dataSelected, ALL_SELECTED)) {
      return options[modelSelected].filter(outAllSelectedOption);
    }
    return dataSelected;
  }
);

const getYColumnOptions = createSelector(
  [ getLegendDataSelected, getMetricSelected, getModelSelected ],
  (legendDataSelected, metricSelected, modelSelected) => {
    if (!legendDataSelected) return null;
    const getYOption = columns =>
      columns &&
        columns.map(d => ({
          label: d && d.label,
          value: d && getYColumnValue(`${modelSelected}${d.value}`),
          code: d && (d.code || d.label)
        }));
    return uniqBy(getYOption(legendDataSelected), 'value');
  }
);

const getCalculationData = createSelector([ getWBData ], data => {
  if (!data || isEmpty(data)) return null;
  const yearData = {};
  Object.keys(data).forEach(iso => {
    data[iso].forEach(d => {
      if (!yearData[d.year]) yearData[d.year] = {};
      yearData[d.year][iso] = { population: d.population, gdp: d.gdp };
    });
  });
  return yearData;
});

const calculateValue = (currentValue, value, scale, metricData) => {
  const metricRatio = metricData || 1;
  const updatedValue = value || value === 0
    ? value * scale / metricRatio
    : null;
  if (updatedValue && (currentValue || currentValue === 0)) {
    return updatedValue + currentValue;
  }
  return updatedValue || currentValue;
};

const getDFilterValue = (d, modelSelected) =>
  modelSelected === 'region' ? d.iso_code3 :  d[modelSelected];

const isOptionSelected = (selectedOptions, valueOrCode) =>
  castArray(selectedOptions)
    .filter(o => o)
    .some(o => o.value === valueOrCode || o.code === valueOrCode);

const filterBySelectedOptions = (
  emissionsData,
  metricSelected,
  selectedOptions,
  filterOptions
) =>
  {
    const fieldPassesFilter = (selectedFilterOption, options, fieldValue) =>
        isOptionSelected(options, fieldValue) &&
        isOptionSelected(selectedFilterOption, fieldValue);

    return emissionsData
      .filter(
        d =>
          FRONTEND_FILTERED_FIELDS.every(
            field =>
              fieldPassesFilter(
                selectedOptions[field],
                filterOptions[field],
                getDFilterValue(d, field)
              )
          )
      );
  };

const parseChartData = createSelector(
  [
    getEmissionsData,
    getSelectedAPI,
    getMetricSelected,
    getModelSelected,
    getYColumnOptions,
    getSelectedOptions,
    getFilterOptions,
    getCorrectedUnit,
    getScale,
    getCalculationData
  ],
  (
    emissionsData,
    api,
    metricSelected,
    modelSelected,
    yColumnOptions,
    selectedOptions,
    filterOptions,
    unit,
    scale,
    calculationData
  ) =>
    {
      if (
        !emissionsData ||
          isEmpty(emissionsData) ||
          !metricSelected ||
          !yColumnOptions
      )
        return null;

      const yearValues = emissionsData[0].emissions.map(d => d.year);

      // for CW API we don't have precalculated data per metric, all values provided
      // are absolute metric, we are going to calculate per gdp, per capita
      // using wb data
      const filteredData = filterBySelectedOptions(
        emissionsData,
        api === API.indo ? metricSelected : 'absolute',
        selectedOptions,
        filterOptions
      );

      const metricField = ({
        per_capita: 'population',
        per_gdp: 'gdp'
      })[metricSelected];

      const dataParsed = [];
      yearValues.forEach(x => {
        const yItems = {};

        // metricData for calculation, only for CW API
        let metricData = api === API.cw &&
          metricField &&
          calculationData &&
          calculationData[x] &&
          calculationData[x][COUNTRY_ISO] &&
          calculationData[x][COUNTRY_ISO][metricField];

        // GDP is in dollars and we want to display it in million dollars
        if (metricField === 'gdp' && metricData) metricData /= 1000000;

        filteredData.forEach(d => {
          const columnObject = yColumnOptions.find(
            c => c.code === getDFilterValue(d, modelSelected)
          );
          const yKey = columnObject && columnObject.value;

          if (yKey) {
            const yData = d.emissions.find(e => e.year === x);
            if (yData && yData.value) {
              yItems[yKey] = yData.value
            }
          }
        });
        const item = { x, ...yItems };
        if (!isEmpty({ ...yItems })) dataParsed.push(item);
      });
      return dataParsed;
    }
);

let colorCache = {};

const parseTargetEmissionsData = createSelector(
  [
    getTargetEmissionsData,
    getSelectedOptions,
    getModelSelected,
    getMetricSelected
  ],
  (targetEmissionsData, selectedOptions, modelSelected, metricSelected) => {
    if (isEmpty(targetEmissionsData)) return null;
    if (metricSelected !== METRIC_OPTIONS.ABSOLUTE_VALUE) return null;
    if (!selectedOptions) return null;
    if (!isOptionSelected(selectedOptions.region, COUNTRY_ISO)) return null;
    if (
      isOptionSelected(selectedOptions.chartType, 'line') &&
        modelSelected === 'sector' &&
        (selectedOptions.sector.value === ALL_SELECTED ||
          isArray(selectedOptions.sector))
    )
      return null;

    const countryData = targetEmissionsData.filter(
      d => d.location === COUNTRY_ISO
    );
    const targetSectors = modelSelected === 'sector' &&
      selectedOptions.sector.value !== ALL_SELECTED
      ? castArray(selectedOptions.sector).map(s => s.code.toUpperCase())
      : [ 'TOTAL' ];

    const targetEmissions = [];

    countryData.forEach(d => {
      // if (d.sector === targetSector) {
      if (targetSectors.includes(d.sector)) {
        const target = targetEmissions.find(
          t => t.x === d.year && t.label === d.label
        ) ||
          { x: d.year, y: 0, label: d.label };
        const newTarget = target.y === 0;
        target.y += d.value * API_TARGET_DATA_SCALE;

        if (newTarget) targetEmissions.push(target);
      }
    });

    return targetEmissions;
  }
);

export const getChartConfig = createSelector(
  [
    getEmissionsData,
    getMetricSelected,
    getYColumnOptions,
    getSelectedOptions,
    getUnit,
    getTranslate
  ],
  (data, metricSelected, yColumnOptions, options, unit, t) => {
    if (!data || isEmpty(data) || !unit || !metricSelected || !yColumnOptions || isEmpty(options))
      return null;
    const tooltip = getTooltipConfig(yColumnOptions);
    const theme = getThemeConfig(yColumnOptions);
    colorCache = { ...theme, ...colorCache };
    const axes = {
      xBottom: { name: 'Year', unit: 'date', format: 'YYYY' },
      yLeft: {
        name: 'Emissions',
        unit, 
        format: 'number'
      }
    };

    return {
      axes,
      theme: colorCache,
      tooltip,
      animation: false,
      columns: { x: [ { label: 'year', value: 'x' } ], y: yColumnOptions }
    };
  }
);

const getGHGEmissions = ({ GHGEmissions = {} }) => GHGEmissions;
const getChartLoading = createSelector(
  [ getMetadata, getGHGEmissions ],
  (metadata, ghgEmissions) =>
    metadata && metadata.loading || ghgEmissions && ghgEmissions.loading
);

const getDataLoading = createSelector(
  [ getChartLoading, parseChartData ],
  (loading, data) => loading || !data || false
);

export const getMetadataSources = createSelector(
  [ getSelectedAPI ],
  api => api === API.indo ? [ 'SIGNSa', 'NDC' ] : [ 'CWI', 'NDC' ]
);

export const getDownloadURI = createSelector(
  [ getSelectedAPI, getMetadataData, getMetadataSources ],
  (api, metadata, metadataSources) => {
    if (!api || !metadataSources || !metadata) return null;

    if (api === API.indo) {
      return `emissions/download?location=${COUNTRY_ISO}&source=${metadataSources.join(
        ','
      )}`;
    }

    const caitId = (findOption(metadata.dataSource, 'CAIT') || {}).value;

    return `${CW_API_URL}/data/historical_emissions/download.csv?regions[]=${COUNTRY_ISO}&source_ids[]=${caitId}`;
  }
);

export const getChartData = createStructuredSelector({
  data: parseChartData,
  projectedData: parseTargetEmissionsData,
  config: getChartConfig,
  loading: getDataLoading,
  dataOptions: getLegendDataOptions,
  dataSelected: getLegendDataSelected
});
