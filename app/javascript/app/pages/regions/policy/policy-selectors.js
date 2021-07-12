/*
  filename: policy-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import { getTranslate } from 'selectors/translation-selectors';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import get from 'lodash/get';
import find from 'lodash/find';
import { format } from 'd3-format';
import isNil from 'lodash/isNil';
import castArray from 'lodash/castArray';
import {
  getThemeConfig,
  getTooltipConfig,
} from 'utils/graphs';
import {
  findOption,
} from 'selectors/filters-selectors';
import { getProvince } from 'selectors/provinces-selectors';

const section = 'province_policies_data';
const provinceISO = 'ID.PB';

const getParams = () => ({ section, location: provinceISO });

const getQuery = ({ location }) => location && (location.query || null);

const getPolicies = ({ policies }) => policies && policies.data;

const getIndicator = ({ indicators }) => indicators && indicators.data;

const indicatorOptions = {
  indicator: [
    {
      label: 'Index Lingkungan Hidup',
      value: 'index_lingdup',
      code: 'index_lingdup'
    }
  ]
};

const defaultDataOptions = () => [
  { label: 'Rencana', value: 'rencana', code: 'rencana' },
  { label: 'Aktualisasi', value: 'aktualisasi', code: 'aktualisasi' },
]

const getFilterOptions = createSelector(getPolicies, data => {
  if (isEmpty(data)) return indicatorOptions;

  const indicator = data.policies.map(item => ({
    label: item.name,
    value: item.code,
    code: item.code
  }));

  return { indicator };
});

const getDefaults = createSelector([getFilterOptions], options => ({
  indicator: get(options, 'indicator[0]')
}));

// SELECTED
const getFieldSelected = field => state => {
  const { query } = state.location;
  if (!query || !query[field]) return getDefaults(state)[field];
  const queryValue = String(query[field]);
  const findSelectedOption = value =>
    findOption(getFilterOptions(state)[field], value);

  const options = queryValue
    .split(',')
    .map(v => findSelectedOption(v))
    .filter(v => v);

  if (options.length > 1) return options;
  return options.length ? options[0] : getDefaults(state)[field];
};

const getSelectedOptions = createStructuredSelector({
  indicator: getFieldSelected('indicator')
});

const getIndicatorOptions = createSelector(getIndicator, indicators => {
  if (isEmpty(indicators)) return null;

  return indicators;
});

const getGoals = createSelector(
  getTranslate,
  t => t('pages.regions.policy.section-one.goals.content')
);

const getObjectives = createSelector(
  getTranslate,
  t => t('pages.regions.policy.section-one.objectives.content')
);

const parseChartData = createSelector([getPolicies, getSelectedOptions], (
  data,
  options
) => {
  if (isEmpty(data) || isEmpty(options)) return null;

  const { values } = data;

  const filteredData = filter(values, function (o) {
    return o.policy_code === options.indicator.code;
  });

  const dataRencana = find(filteredData, ['category', 'rencana_awal'])
  const dataAktualisasi = find(filteredData, ['category', 'aktualisasi'])

  const yearAxis = filteredData[0].values.map(o => o.year);
  const policiesData = [];

  yearAxis.forEach(element => {
    const object = {}

    object.x = element
    object.rencana = find(dataRencana.values, ['year', element]).value
    object.aktualisasi = find(dataAktualisasi.values, ['year', element]).value

    policiesData.push(object)
  });

  return policiesData;
});

export const getChartConfig = createSelector(
  [
    parseChartData,
    getSelectedOptions,
  ],
  (data, options) => {
    if (!data) return null
    if (isNil(options.indicator)) return null

    const yColumnOptions = [{label: 'Rencana', value: 'rencana'}, {label: 'Aktualisasi', value: 'aktualisasi'}]

    const tooltip = getTooltipConfig(yColumnOptions);

    const theme = {
      rencana: { stroke: "#0677b3", fill: "0677b3" },
      aktualisasi: { stroke: "#a83232", fill: "#a83232" },
    }

    const axes = {
      xBottom: { name: 'year', unit: 'year', format: 'YYYY' },
      yLeft: {
        name: options.indicator.label,
        unit: 'percent',
        format: 'number',
      }
    }

    const columns = { x: [{ label: 'year', value: 'x' }], y: yColumnOptions }

    return {
      axes,
      animation: false,
      columns,
      tooltip,
      theme
    }
  }
);

const getChartData = createStructuredSelector({
  config: getChartConfig,
  // loading: getDataLoading,
  dataOptions: defaultDataOptions,
  dataSelected: defaultDataOptions,
  data: parseChartData
});

const getTableData = createSelector(
  [getPolicies, getSelectedOptions],
  (data, options) => {
    if (isEmpty(data) || isEmpty(data.values) || !options) return null

    const { code } = options.indicator

    const filteredData = filter(data.values, function(o) {
      return o.policy_code === code
    })

    const years = filteredData[0].values.map(x => x.year)

    const tableData = []
    years.forEach(x => {
      const object = {}
      object.tahun = x

      const rencanaData = find(filteredData, ['category', 'rencana_awal'])
      const rencanaValue = find(rencanaData.values, ['year', x]).value
      object.rencana = `${format(',.1f')(rencanaValue)} %`

      const aktualisasiData = find(filteredData, ['category', 'aktualisasi'])
      const aktualisasiValue = find(aktualisasiData.values, ['year', x]).value
      object.aktualisasi = `${format(',.1f')(aktualisasiValue)} %`

      object.deskripsi = '-'

      tableData.push(object)
    })

    return tableData
  }
)

const getDefaultColumns = createSelector(
  parseChartData,
  data => {
    if (!data || isEmpty(data)) return null
    const defaultColumns = ['tahun', 'rencana', 'aktualisasi', 'deskripsi']

    return defaultColumns
  }
)

const firstColumnHeaders = () => (['tahun', 'rencana'])

const getTableConfig = createStructuredSelector({
  defaultColumns: getDefaultColumns,
  firstColumnHeaders
});

export const getPolicy = createStructuredSelector({
  t: getTranslate,
  tableData: getTableData,
  tableConfig: getTableConfig,
  params: getParams,
  filterOptions: getFilterOptions,
  selectedOptions: getSelectedOptions,
  goals: getGoals,
  objectives: getObjectives,
  indicatorOptions: getIndicatorOptions,
  provinceISO: getProvince,
  chartData: getChartData
});
