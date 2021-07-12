/*
  filename: historical-emissions-data-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

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
} from './historical-emissions-get-selectors';
import {
  getSelectedOptions,
  getFilterOptions,
  getModelSelected,
  getMetricSelected
} from './historical-emissions-filter-selectors';

const { COUNTRY_ISO } = process.env;
const { CW_API_URL } = process.env;

const FRONTEND_FILTERED_FIELDS = [ 'region', 'sector' ];

const getUnit = createSelector([ getMetadataData, getMetricSelected ], (
  meta,
  metric
) =>
  {
    if (!meta || !metric) return null;
    const { metric: metrics } = meta;
    const metricObject = metrics &&
      metrics.find(m => METRIC[metric] === m.code);
    return metricObject && metricObject.unit;
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
    if (!options || !modelSelected || !options[modelSelected]) return null;
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
    : 0;
  if (updatedValue && (currentValue || currentValue === 0)) {
    return updatedValue + currentValue;
  }
  return updatedValue || currentValue;
};

const getDFilterValue = (d, modelSelected) =>
  modelSelected === 'region' ? d.iso_code3 : d[modelSelected];

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
      isOptionSelected(selectedFilterOption, ALL_SELECTED) &&
        isOptionSelected(options, fieldValue) ||
        isOptionSelected(selectedFilterOption, fieldValue);
    const absoluteMetric = METRIC.absolute;

    const byMetric = d => {
      const notTotalWithAbsoluteMetric = d.metric === absoluteMetric &&
        d.sector !== SECTOR_TOTAL;

      return d.metric === METRIC[metricSelected] &&
        (notTotalWithAbsoluteMetric || d.metric !== absoluteMetric);
    };

    return emissionsData
      .filter(byMetric)
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

      const yearValues = [...Array(42).keys()].map(i => i + 1990);

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
              yItems[yKey] = calculateValue(
                yItems[yKey],
                yData.value,
                scale,
                metricData
              );
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

const getProjectedChartConfig = createSelector(
  [ parseTargetEmissionsData, getTranslate ],
  (targetEmissionsData, t) => {
    if (isEmpty(targetEmissionsData)) return {};

    const targetLabels = t(
      'pages.national-context.historical-emissions.target-labels',
      { default: {} }
    );

    return {
      projectedColumns: [
        { label: targetLabels.bau, color: '#113750' },
        { label: targetLabels.quantified, color: '#ffc735' },
        { label: targetLabels['not-quantifiable'], color: '#b1b1c1' }
      ],
      projectedLabel: {}
    };
  }
);

export const getChartConfig = createSelector(
  [
    getEmissionsData,
    getMetricSelected,
    getProjectedChartConfig,
    getCorrectedUnit,
    getYColumnOptions,
    getTranslate
  ],
  (data, metricSelected, projectedConfig, unit, yColumnOptions) => {
    if (!data || isEmpty(data) || !metricSelected || !yColumnOptions)
      return null;
    const tooltip = getTooltipConfig(yColumnOptions);
    const theme = getThemeConfig(yColumnOptions);
    colorCache = { ...theme, ...colorCache };
    const axes = {
      ...DEFAULT_AXES_CONFIG,
      yLeft: { ...DEFAULT_AXES_CONFIG.yLeft, unit }
    };

    const config = {
      axes,
      theme: colorCache,
      tooltip,
      animation: false,
      columns: { x: [ { label: 'year', value: 'x' } ], y: yColumnOptions }
    };

    return { ...config, ...projectedConfig };
  }
);

const getGHGEmissions = ({ GHGEmissions = {} }) => GHGEmissions;
const getChartLoading = createSelector(
  [ getMetadata, getGHGEmissions ],
  (metadata, ghgEmissions) =>
    (metadata && metadata.loading) || (ghgEmissions && ghgEmissions.loading)
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
