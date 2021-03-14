import { createStructuredSelector, createSelector } from 'reselect'
import { getTranslate } from 'selectors/translation-selectors'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import filter from 'lodash/filter'
import get from 'lodash/get'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
import {
  getAllSelectedOption,
  findOption,
} from 'selectors/filters-selectors'

import {
  getThemeConfig,
  getYColumnValue,
  getTooltipConfig
} from 'utils/graphs';

import { ALL_SELECTED } from 'constants/constants'
import { getProvince } from 'selectors/provinces-selectors'
import { castArray } from 'lodash-es'

const getChartType = () => ([
  { label: 'line', value: 'line' },
  { label: 'bar', value: 'bar' },
])

const getModelOptions = createSelector(getTranslate, t => [
  {
    name: t('pages.regions.social.switch.education'),
    value: 'education',
  },
  {
    name: t('pages.regions.social.switch.healthcare'),
    value: 'healthcare',
  },
])

const getDefaultIndicator = () => [
  {
    label: 'Human Development Index',
    value: 'province_hdi',
    unit: 'unit',
  },
  {
    label: 'Healthcare Infrastructure',
    value: 'province_health_infrastructure',
    unit: 'unit',
  },
]

const section = 'province_social'
const provinceISO = 'ID.PB'
const code = 'code-kabupaten'

const getIndicatorParams = () => ({ section })

const getMetaParams = () => ({ section, code, location: provinceISO })

const getQuery = ({ location }) => location && (location.query || null)

const getIndicator = ({ indicators }) => indicators && indicators.data

const getMetadata = ({ provinceMeta }) => provinceMeta && provinceMeta.data

const getSelectedModel = createSelector(
  [getQuery, getModelOptions],
  (query, options) => {
    if (!query || !query.model) {
      return { name: 'Education', value: 'education' }
    }

    return options.find((opt) => opt.value === query.model)
  }
)

const getIndicatorSocial = createSelector(getIndicator, (indicators) => {
  if (isEmpty(indicators)) return null

  const data = filter(indicators.values, function (datum) {
    return (
      datum.indicator_code === 'province_hdi' ||
      datum.indicator_code === 'province_literacy_rate' ||
      datum.indicator_code === 'province_illiterate' ||
      datum.indicator_code === 'province_health_infrastructure' ||
      datum.indicator_code === 'province_drinking_access'
    )
  })

  return data
})

const getIndicatorOptions = createSelector(
  [getSelectedModel, getMetadata],
  (model, metadata) => {
    if (!model || isEmpty(metadata)) return null

    const indicators = metadata.indicators.map((o) => ({
      label: o.name,
      value: o.code,
      unit: o.unit,
    }))

    const edu = ['province_hdi', 'province_illiterate', 'province_literacy_rate']
    const health = ['province_health_infrastructure', 'province_drinking_access']
    if (model.value === 'education') {
      return filter(indicators, function (o) {
        return edu.includes(o.value)
      })
    }

    return filter(indicators, function (o) {
      return health.includes(o.value)
    })
  }
)

const getDistrictOptions = createSelector(getMetadata, (metadata) => {
  if (isEmpty(metadata)) return null

  const { locations } = metadata

  const sortedLocations = sortBy(locations, ['name'])

  return sortedLocations.map((val) => ({
    label: val.name,
    value: val.iso_code3,
    code: val.iso_code3,
  }))
})

const getFilterOptions = createStructuredSelector({
  model: getModelOptions,
  indicator: getIndicatorOptions,
  district: getDistrictOptions,
  chartType: getChartType,
})

// DEFAULTS
const getDefaults = createSelector(
  [
    getSelectedModel,
    getFilterOptions,
    getAllSelectedOption,
    getDefaultIndicator,
  ],
  (model, options, allSelectedOption, defaultIndicator) => ({
    model: get(options, 'model[0]'),
    indicator:
      model.value === 'education' ? defaultIndicator[0] : defaultIndicator[1],
    district: get(options, 'district[0]'),
    chartType: get(options, 'chartType[0]'),
  })
)

// SELECTED
const getFieldSelected = (field) => (state) => {
  const { query } = state.location
  if (!query || !query[field]) return getDefaults(state)[field]

  const queryValue = String(query[field])
  if (queryValue === ALL_SELECTED) return getAllSelectedOption(state)
  const findSelectedOption = (value) =>
    findOption(getFilterOptions(state)[field], value)

  const options = queryValue
    .split(',')
    .map((v) => findSelectedOption(v))
    .filter((v) => v)

  if (options.length > 1) return options
  return options.length ? options[0] : getDefaults(state)[field]
}

const getSelectedOptions = createStructuredSelector({
  model: getFieldSelected('model'),
  indicator: getFieldSelected('indicator'),
  district: getFieldSelected('district'),
  chartType: getFieldSelected('chartType'),
})

// DATA
const getLegendDataOptions = createSelector(
  [getSelectedModel, getFilterOptions],
  (model, options) => {
    if (!model) return null
    if (isEmpty(options)) return null

    return options.district
  }
)

const getLegendDataSelected = createSelector(
  [getSelectedOptions],
  (options) => {

    if (isEmpty(options) || isNil(options.district)) return null
    
    return castArray(options.district)
  }
)

const getYColumnOptions = createSelector(
  [getLegendDataSelected],
  legendDataSelected => {
    if (!legendDataSelected) return null;

    const selectedLegend = legendDataSelected.filter(data => data.value !== 'all-selected')
    return selectedLegend.map(d => ({
      ...d,
      value: getYColumnValue(d.value)
    }));
  }
);

const getChartData = createSelector(
  [getSelectedModel, getIndicatorSocial, getSelectedOptions, getYColumnOptions],
  (model, indicators, options, yColumnOptions) => {
    if (isEmpty(indicators)) return null
    if (!options || !options.indicator || !options.district) return null
    if (!model) return null

    const edu = ['province_hdi', 'province_illiterate', 'province_literacy_rate']
    const health = ['province_health_infrastructure', 'province_drinking_access']

    const selectedModel = model.value
    const selectedInd = options.indicator.value
    const selectedDist = castArray(options.district)

    const mappedDist = selectedDist.map(o => o.value)

    let selectedIndicators = []
    if (selectedModel === 'education') {
      selectedIndicators = filter(indicators, function (o) {
        return edu.includes(o.indicator_code)
      })
    } else {
      selectedIndicators = filter(indicators, function (o) {
        return health.includes(o.indicator_code)
      })
    }

    const filteredIndicators = filter(selectedIndicators, function (o) {
      return (
        o.indicator_code === selectedInd &&
        mappedDist.includes(o.location_iso_code3)
      )
    })

    const xAxis = selectedIndicators[0].values.map((val) => val.year)
    const data = []
    xAxis.forEach((x) => {
      const object = {}

      object.x = x

      yColumnOptions.forEach(yColumn => {
        const filterByCode = find(filteredIndicators, ['location_iso_code3', yColumn.code])
        if(find(filterByCode.values, ['year', x]).value !== 0) {
          object[yColumn.value] = find(filterByCode.values, ['year', x]).value
        }
      })

      data.push(object)
    })

    return data
  }
)

// Y LABEL FORMATS
const getCustomYLabelFormat = (unit) => {
  const formatY = {
    '%': (value) => `${value}`,
    'satuan': (value) => `${value}`,
  }
  return formatY[unit]
}

const getChartConfig = createSelector(
  [
    getChartData,
    getYColumnOptions,
    getSelectedOptions,
    getTranslate
  ],
  (data, yColumnOptions, options, t) => {
    if (!yColumnOptions || !data) return null
    if (isNil(options.indicator)) return null

    let colorCache = {};
    
    const name = options.indicator.label
    const { unit } = options.indicator

    const tooltip = getTooltipConfig(yColumnOptions);
    const theme = getThemeConfig(yColumnOptions);
    colorCache = { ...theme, ...colorCache };
    console.log('colorCache', colorCache)

    const year = t(
      `pages.regions.economy.unit.year}`
    );

    const axes = {
      xBottom: { name: year, unit: year, format: 'YYYY' },
      yLeft: {
        name,
        unit: t(`pages.regions.social.unit.${unit}`),
        format: 'string',
        label: { dx: 0, dy: 10, className: '' },
      },
    }

    const yLabelFormat = getCustomYLabelFormat(unit)
    const columns = { x: [ { label: 'year', value: 'x' } ], y: yColumnOptions }

    return {
      axes,
      theme: colorCache,
      animation: false,
      tooltip,
      columns,
      yLabelFormat
    }
  }
);

const getChart = createStructuredSelector({
  config: getChartConfig
})

export const getRegionSocial = createStructuredSelector({
  t: getTranslate,
  query: getQuery,
  indicatorParams: getIndicatorParams,
  metaParams: getMetaParams,
  provinceISO: getProvince,
  selectedModel: getSelectedModel,
  filterOptions: getFilterOptions,
  selectedOptions: getSelectedOptions,
  chartData: getChartData,
  dataOptions: getLegendDataOptions,
  dataSelected: getLegendDataSelected,
  chart: getChart,
})
