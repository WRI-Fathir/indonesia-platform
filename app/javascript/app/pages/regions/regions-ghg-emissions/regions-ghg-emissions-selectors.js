/*
  filename: regions-ghg-emissions-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import castArray from 'lodash/castArray';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { format } from 'd3-format';
import {
  ALL_SELECTED,
  API_TARGET_DATA_SCALE,
  EMISSION_TARGET,
  METRIC,
  SECTOR_TOTAL,
  SOURCE
} from 'constants/constants';

import {
  getAllSelectedOption,
  findOption,
  withAllSelected
} from 'selectors/filters-selectors';
import { getProvince } from 'selectors/provinces-selectors';
import { getTranslate } from 'selectors/translation-selectors';

import {
  DEFAULT_AXES_CONFIG,
  getThemeConfig,
  getYColumnValue,
  getTooltipConfig
} from 'utils/graphs';

const { COUNTRY_ISO } = process.env;

const FRONTEND_FILTERED_FIELDS = [ 'gas', 'sector', 'metric' ];

const DEFAULTS = {
  gas: 'CO2EQ'
}

const getQuery = ({ location }) => location && (location.query || null);

const getMetadataData = ({ metadata }) =>
  metadata && metadata.ghgindo && metadata.ghgindo.data;

export const getEmissionsData = ({ GHGEmissions }) =>
  get(GHGEmissions, 'data.length') ? GHGEmissions.data : [];

const getTargetEmissionsData = ({ GHGTargetEmissions }) =>
  get(GHGTargetEmissions, 'data.length') ? GHGTargetEmissions.data : [];

const getProvinceTargetEmissionsData = createSelector(
  [ getTargetEmissionsData, getProvince ],
  (emissionTargets, provinceISO) =>
    emissionTargets.filter(e => e.location === provinceISO)
);

const getProvinceEmissionsData = createSelector(
  [ getEmissionsData, getProvince ],
  (emissionsData, provinceISO) =>
    emissionsData.filter(e => e.iso_code3 === provinceISO)
);

const getSource = createSelector(getMetadataData, meta => {
  if (!meta || !meta.dataSource) return null;
  const selected = meta.dataSource.find(
    source => source.label === SOURCE.SIGN_SMART
  );
  return selected && selected.value;
});

const getFieldOptionsNotFiltered = field => createSelector(
  [ getMetadataData, getQuery ],
  metadata => get(metadata, field, [])
    .map(o => ({ label: o.label, value: String(o.value), code: o.code }))
    .filter(o => o)
);

const getMetricSelected = createSelector(
  [ getQuery, getFieldOptionsNotFiltered('metric') ],
  (query, metricOptions) => {
    if (!metricOptions || !metricOptions.length) return null;
    if (!query || !query.metric) return metricOptions[0];

    const queryValue = String(query.metric);
    return findOption(metricOptions, queryValue);
  }
);

const getFieldOptions = field =>
  createSelector([ getFieldOptionsNotFiltered(field), getMetricSelected ], (
    options,
    metricSelected
  ) =>
    {
      if (field !== 'sector' || !metricSelected) return options;
      if (metricSelected.code === METRIC.absolute) {
        return options.filter(o => o.code !== SECTOR_TOTAL);
      }
      return options.filter(o => o.code === SECTOR_TOTAL);
    });

export const getFilterOptions = createStructuredSelector({
  sector: withAllSelected(getFieldOptions('sector')),
  gas: getFieldOptions('gas'),
  metric: getFieldOptions('metric')
});

// DEFAULTS
const getDefaults = createSelector([ getFilterOptions, getAllSelectedOption ], (
  options,
  allSelectedOption
) => ({
  sector: allSelectedOption,
  gas: findOption(options.gas, DEFAULTS.gas),
  metric: get(options, 'metric[0]')
}));

// SELECTED
const getFieldSelected = field => state => {
  const { query } = state.location;
  if (!query || !query[field]) return getDefaults(state)[field];
  const queryValue = String(query[field]);
  if (queryValue === ALL_SELECTED) return getAllSelectedOption(state);
  const findSelectedOption = value =>
    findOption(getFilterOptions(state)[field], value);

  const options = queryValue
    .split(',')
    .map(v => findSelectedOption(v))
    .filter(v => v);

  if (options.length > 1) return options;
  return options.length ? options[0] : getDefaults(state)[field];
};

export const getSelectedOptions = createStructuredSelector({
  metric: getFieldSelected('metric'),
  sector: getFieldSelected('sector'),
  gas: getFieldSelected('gas')
});

const getSectorsSelected = createSelector(
  [ getFieldOptions('sector'), getFieldSelected('sector') ],
  (sectors, selectedSector) => {
    if (!sectors || !selectedSector) return null;

    if (selectedSector.value === ALL_SELECTED) return sectors;

    return castArray(selectedSector);
  }
);

export const getEmissionParams = createSelector([ getMetadataData, getSource ], (meta, source) => {
  if (!source) return null;
  const category = findOption(meta.category, SECTOR_TOTAL).value;
  const sub_category = findOption(meta.subCategory, SECTOR_TOTAL).value;

  return { location: 'IDN', source, category, sub_category };
});

// DATA
export const getUnit = createSelector(
  [ getMetadataData, getFieldSelected('gas') ],
  (meta, gas) => {
    if (!meta || !gas) return null;
    const { unit } = findOption(meta.gas, gas.value)

    return unit
  }
);

export const getScale = createSelector([ getUnit ], unit => {
  if (!unit) return null;
  if (unit.startsWith('Mt')) return 1000000;
  if (unit.startsWith('kt')) return 1000;
  return 1;
});

export const getCorrectedUnit = createSelector([ getUnit, getScale ], (unit, scale) =>
  {
    if (!unit || !scale) return null;
    if (unit.startsWith('kt')) return unit.replace('kt', 't');

    return unit.replace('Mt', 't');
  });

const getLegendDataOptions = getFieldOptions('sector');
const getLegendDataSelected = getSectorsSelected;

const getYColumnOptions = createSelector(
  [ getLegendDataSelected ],
  legendDataSelected => {
    if (!legendDataSelected) return null;

    return legendDataSelected.map(d => ({
      ...d,
      value: getYColumnValue(d.value)
    }));
  }
);

export const filterBySelectedOptions = (emissionsData, selectedOptions) => {
  const fieldPassesFilter = (selectedFilterOption, field, data) =>
    castArray(selectedFilterOption).some(
      o => o.value === ALL_SELECTED || o.code === data[field]
    );

  return emissionsData.filter(
    d =>
      FRONTEND_FILTERED_FIELDS.every(
        field => fieldPassesFilter(selectedOptions[field], field, d)
      )
  );
};

const parseChartData = createSelector(
  [
    getProvinceEmissionsData,
    getYColumnOptions,
    getSelectedOptions,
    getCorrectedUnit,
    getScale
  ],
  (emissionsData, yColumnOptions, selectedOptions, unit, scale) => {
    if (!emissionsData || !yColumnOptions) return null;
    const yearValues = emissionsData.length
      ? emissionsData[0].emissions.map(d => d.year)
      : [];

    const filteredData = filterBySelectedOptions(
      emissionsData,
      selectedOptions
    );

    const dataParsed = [];
    yearValues.forEach(x => {
      const yItems = {};
      filteredData.forEach(d => {
        const columnObject = yColumnOptions.find(c => c.code === d.sector);
        const yKey = columnObject && columnObject.value;
        if (yKey) {
          const yData = d.emissions.find(e => e.year === x);
          if (yData && yData.value) {
            yItems[yKey] = (yItems[yKey] || 0) + yData.value * scale;
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

// Y LABEL FORMATS
const getCustomYLabelFormat = unit => {
  const formatY = {
    'MtCO2e': value => `${(value)}`,
    'MtCO2e/Capita': value => value,
    'MtCO2e/billion Rupiah': value => `${format(',.0f')(value/1e3)} ribu`
  };
  return formatY[unit];
};

export const getChartConfig = createSelector(
  [
    parseChartData,
    getProvinceTargetEmissionsData,
    getCorrectedUnit,
    getYColumnOptions,
    getFieldSelected('metric'),
    getTranslate
  ],
  (data, targetEmissionsData, unit, yColumnOptions, metricSelected, t) => {
    if (!data || !metricSelected) return null;
    const tooltipModified = getTooltipConfig(yColumnOptions);
    const theme = getThemeConfig(yColumnOptions);
    colorCache = { ...theme, ...colorCache };
    const axes = {
      ...DEFAULT_AXES_CONFIG,
      yLeft: { ...DEFAULT_AXES_CONFIG.yLeft, unit: `${unit}`}
    };
    const targetLabels = t(
      'pages.national-context.historical-emissions.target-labels',
      { default: {} }
    );

    const projectedConfig = {
      projectedColumns: [
        { label: targetLabels.bau, color: '#113750' },
        { label: targetLabels.quantified, color: '#ffc735' },
        { label: targetLabels['not-quantifiable'], color: '#b1b1c1' }
      ],
      projectedLabel: {}
    };

    const yLabelFormat = getCustomYLabelFormat(unit)

    const config = {
      axes,
      theme: colorCache,
      tooltip: tooltipModified,
      animation: false,
      columns: { x: [ { label: 'year', value: 'x' } ], y: yColumnOptions },
      yLabelFormat
    };

    const hasTargetEmissions = targetEmissionsData &&
      !isEmpty(targetEmissionsData) &&
      metricSelected.code === METRIC.absolute;

    return hasTargetEmissions ? { ...config, ...projectedConfig } : config;
  }
);

const parseTargetEmissionsData = createSelector(
  [ getProvinceTargetEmissionsData, getProvince, getFieldSelected('metric') ],
  (provinceTargets, provinceISO, metricSelected) => {
    if (
      !provinceTargets ||
        isEmpty(provinceTargets) ||
        !metricSelected ||
        metricSelected.code !== METRIC.absolute
    )
      return null;

    const parsedTargetEmissions = [];
    provinceTargets.forEach(d => {
      if (d.sector === SECTOR_TOTAL) {
        parsedTargetEmissions.push({
          x: d.year,
          y: d.value * API_TARGET_DATA_SCALE,
          label: d.label
        });
      }
    });

    return parsedTargetEmissions;
  }
);

const getChartDomain = createSelector(
  parseChartData,
  data => {
    if (!data) return null
    const domainY = [ 'auto', 'auto'];
    const domain = { x: [ 'auto', 'auto' ], y: domainY }
    return domain
  }
)

const getChartLoading = ({ metadata = {}, GHGEmissions = {} }) =>
  (metadata && metadata.ghgindo.loading) || (GHGEmissions && GHGEmissions.loading);

const getDataLoading = createSelector(
  [ getChartLoading, parseChartData ],
  (loading, data) => loading || !data || false
);

const targetsOrder = [ EMISSION_TARGET.target, EMISSION_TARGET.bau ];
const getEmissionTargetsForCharts = createSelector(
  getProvinceTargetEmissionsData,
  emissionTargets => emissionTargets
    .filter(et => et.sector !== SECTOR_TOTAL)
    .sort(
      (a, b) => targetsOrder.indexOf(a.label) - targetsOrder.indexOf(b.label)
    )
);

export const getChartData = createStructuredSelector({
  data: parseChartData,
  domain: getChartDomain,
  projectedData: parseTargetEmissionsData,
  config: getChartConfig,
  loading: getDataLoading,
  dataOptions: getLegendDataOptions,
  dataSelected: getLegendDataSelected
});

export const getGHGEmissions = createStructuredSelector({
  chartData: getChartData,
  emissionParams: getEmissionParams,
  emissionTargets: getEmissionTargetsForCharts,
  selectedOptions: getSelectedOptions,
  filterOptions: getFilterOptions,
  query: getQuery,
  allSelectedOption: getAllSelectedOption,
  provinceISO: getProvince,
  t: getTranslate
});

