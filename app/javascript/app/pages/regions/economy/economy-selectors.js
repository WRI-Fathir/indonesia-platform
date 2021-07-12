/*
  filename: economy-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import castArray from 'lodash/castArray';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import isUndefined from 'lodash/isUndefined';
import filter from 'lodash/filter';
import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import { ALL_SELECTED, WEST_PAPUA } from 'constants/constants';

import {
  getAllSelectedOption,
  findOption,
  withAllSelected
} from 'selectors/filters-selectors';
import { getProvince } from 'selectors/provinces-selectors';
import { getTranslate } from 'selectors/translation-selectors';

import {
  getThemeConfig,
  getYColumnValue,
  getTooltipConfig
} from 'utils/graphs';

const section = 'province_economic';
const KABUPATEN = 'kabupaten';
const SEKTOR = 'sektor';

const getQuery = ({ location }) => location && (location.query || null);

const getMetadataParams = createSelector(getProvince, provinceISO => {
  if (!provinceISO) return null;

  return { section, location: provinceISO };
});

const getMetadataData = ({ provinceMeta }) => provinceMeta && provinceMeta.data;

const getIndicatorData = ({ indicators }) =>
  indicators && indicators.data && indicators.data.values;

const getIndicatorParams = () => ({ section });

const getChartType = () => [
  { label: 'line', value: 'line' },
  { label: 'area', value: 'area' }
];

const getSelectedModel = createSelector(getQuery, query => {
  if (!query || !query.indicator) return 'kabupaten';

  return query.indicator.split('-')[1];
});

const getFieldOptionsNotFiltered = field => createSelector(
  [ getMetadataData, getQuery ],
  metadata => get(metadata, field, [])
    .map(o => ({
      label: o.label || o.name,
      value: o.id,
      code: o.code || o.iso_code3
    }))
    .filter(o => o)
);

const getIndicatorOptions = field => createSelector(
  [ getMetadataData, getQuery ],
  metadata => get(metadata, field, [])
    .map(o => ({
      label: o.label || o.name,
      value: o.code,
      code: o.code || o.iso_code3
    }))
    .filter(o => o)
);

const getFieldOptions = field =>
  createSelector([ getFieldOptionsNotFiltered(field), getSelectedModel ], (
    options,
    modelSelected
  ) =>
    {
      if (modelSelected === KABUPATEN) {
        if (field === 'locations') return sortBy(options, [ 'label' ]);
        return options.filter(o => o.label === 'total');
      }

      if (field === 'locations') {
        options.unshift(WEST_PAPUA);
        return options;
      }

      return sortBy(options.filter(o => o.label !== 'total'), [ 'label' ]);
    });

const getFilterOptions = createStructuredSelector({
  indicator: getIndicatorOptions('indicators'),
  district: withAllSelected(getFieldOptions('locations')),
  sector: withAllSelected(getFieldOptions('sectors')),
  chartType: getChartType
});

// DEFAULTS
const getDefaults = createSelector([ getFilterOptions ], options => ({
  indicator: get(options, 'indicator[0]'),
  sector: get(options, 'sector[0]'),
  district: get(options, 'district[0]'),
  chartType: get(options, 'chartType[0]')
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

export const getSelectedOptions = createStructuredSelector({
  indicator: getFieldSelected('indicator'),
  sector: getFieldSelected('sector'),
  district: getFieldSelected('district'),
  chartType: getFieldSelected('chartType')
});

// DATA
export const getUnit = createSelector([ getMetadataData, getSelectedOptions ], (
  meta,
  options
) =>
  {
    if (isEmpty(meta) || isEmpty(meta.indicators)) return null;
    const indicator = find(meta.indicators, [ 'code', options.indicator.code ]);

    return indicator.unit;
  });

const getLegendDataOptions = createSelector(
  [ getSelectedModel, getFilterOptions ],
  (model, options) => {
    if (!model) return null;
    if (isEmpty(options)) return null;

    if (model === KABUPATEN) return options.district;

    return options.sector;
  }
);
const getLegendDataSelected = createSelector(
  [ getSelectedModel, getSelectedOptions, getFilterOptions ],
  (model, options, filterOptions) => {
    if (!model) return null;
    if (isEmpty(options) || isNil(options.district) || isNil(options.sector))
      return null;
    if (
      isEmpty(filterOptions) ||
        isNil(filterOptions.district) ||
        isNil(filterOptions.sector)
    )
      return null;

    if (model === KABUPATEN) {
      if (options.district.value === 'all-selected') {
        return castArray(filterOptions.district);
      }

      return castArray(options.district);
    }

    if (options.sector.value === 'all-selected') {
      return castArray(filterOptions.sector);
    }

    return castArray(options.sector);
  }
);

const getYColumnOptions = createSelector(
  [ getLegendDataSelected ],
  legendDataSelected => {
    if (!legendDataSelected) return null;
    const selectedLegend = legendDataSelected.filter(
      data => data.value !== 'all-selected'
    );
    return selectedLegend.map(d => ({ ...d, value: getYColumnValue(d.value) }));
  }
);

const filteredDataBySelectedOptions = (model, data, selectedOptions) => {
  if (isUndefined(selectedOptions.indicator)) return null;
  if (isUndefined(selectedOptions.district)) return null;
  if (isUndefined(selectedOptions.sector)) return null;

  const selectedIndicator = selectedOptions.indicator.value;
  const selectedDistricts = castArray(selectedOptions.district).map(
    o => o.value
  );
  const selectedSectors = castArray(selectedOptions.sector).map(o => o.value);

  const filteredBySource = filter(data, function(o) {
    return !isEmpty(o.source);
  });

  const filterByInd = filter(filteredBySource, function(o) {
    return o.indicator_code === selectedIndicator;
  });

  const selectAllDistrict = selectedDistricts[0] === ALL_SELECTED;
  const selectAllSector = selectedSectors[0] === ALL_SELECTED;

  if (model === KABUPATEN) {
    return selectAllDistrict
      ? filterByInd
      : filter(filterByInd, o => selectedDistricts.includes(o.location_id));
  }

  return selectAllSector
    ? filterByInd
    : filter(filterByInd, o => selectedSectors.includes(o.category_id));
};

const parseChartData = createSelector(
  [ getSelectedModel, getIndicatorData, getYColumnOptions, getSelectedOptions ],
  (model, indicatorData, yColumnOptions, selectedOptions) => {
    if (isEmpty(indicatorData)) return null;
    if (!yColumnOptions) return null;
    if (selectedOptions.indicator === undefined) return null;
    if (isUndefined(selectedOptions.district)) return null;
    if (isUndefined(selectedOptions.indicator)) return null;
    if (isUndefined(selectedOptions.sector)) return null;

    const filteredData = filteredDataBySelectedOptions(
      model,
      indicatorData,
      selectedOptions
    );

    if (isEmpty(filteredData) || isNil(filteredData)) return null;

    const yearAxis = filteredData[0].values.map(o => o.year);

    const data = [];
    if (model === KABUPATEN) {
      yearAxis.forEach(x => {
        const object = {};

        object.x = x;
        yColumnOptions.forEach(option => {
          const dataByOption = find(filteredData, [
            'location_iso_code3',
            option.code
          ]);
          object[option.value] = find(dataByOption.values, [ 'year', x ]).value;
        });

        data.push(object);
      });
    }

    if (model === SEKTOR) {
      yearAxis.forEach(x => {
        const object = {};

        object.x = x;
        yColumnOptions.forEach(option => {
          const dataByOption = find(filteredData, [
            'category_id',
            option.code
          ]);
          object[option.value] = find(dataByOption.values, [ 'year', x ]).value;
        });

        data.push(object);
      });
    }

    return data;
  }
);

// Y LABEL FORMATS
const getCustomYLabelFormat = unit => {
  const formatY = {
    'million-idr': value =>
      Intl
        .NumberFormat('in-ID', { maximumFractionDigits: 2 })
        .format(value / 1e3),
    percent: value =>
      Intl.NumberFormat('in-ID', { maximumFractionDigits: 2 }).format(value),
    people: value =>
      Intl.NumberFormat('in-ID', { maximumFractionDigits: 2 }).format(value)
  };
  return formatY[unit];
};

const getFormatFunction = unit => {
  const formatY = {
    'million-idr': value =>
      Intl
        .NumberFormat('in-ID', { maximumFractionDigits: 2 })
        .format(value / 1e3),
    percent: value =>
      Intl.NumberFormat('in-ID', { maximumFractionDigits: 2 }).format(value),
    people: value =>
      Intl.NumberFormat('in-ID', { maximumFractionDigits: 2 }).format(value)
  };

  return formatY[unit];
};

const getTableValueFormat = (unit, value) => {
  const formatY = {
    'million-idr': Intl
      .NumberFormat('in-ID', { maximumFractionDigits: 2 })
      .format(value / 1e3),
    percent: Intl
      .NumberFormat('in-ID', { maximumFractionDigits: 2 })
      .format(value),
    people: Intl
      .NumberFormat('in-ID', { maximumFractionDigits: 2 })
      .format(value)
  };

  return formatY[unit];
};

export const getChartConfig = createSelector(
  [
    parseChartData,
    getYColumnOptions,
    getUnit,
    getSelectedOptions,
    getTranslate
  ],
  (data, yColumnOptions, unit, options, t) => {
    if (!yColumnOptions || !data) return null;
    if (!unit || isNil(options.indicator)) return null;

    let colorCache = {};

    const theme = getThemeConfig(yColumnOptions);

    const year = upperFirst(t(`common.unit.year}`));

    const tooltip = {
      ...getTooltipConfig(yColumnOptions),
      x: { label: year },
      theme,
      formatFunction: getFormatFunction(unit)
    };

    colorCache = { ...theme, ...colorCache };

    const axes = {
      xBottom: { name: year, unit: year, format: 'YYYY' },
      yLeft: {
        name: options.indicator.label,
        unit: upperFirst(t(`common.unit.${unit}`)),
        format: 'number'
      }
    };

    const yLabelFormat = getCustomYLabelFormat(unit);
    const columns = { x: [ { label: year, value: 'x' } ], y: yColumnOptions };
    return {
      axes,
      theme: colorCache,
      animation: false,
      tooltip,
      columns,
      yLabelFormat
    };
  }
);

const getDefaultColumns = createSelector(parseChartData, data => {
  if (!data || isEmpty(data)) return null;

  const years = data.map(dt => dt.x);

  const defaultColumns = [ 'indicator', 'unit', ...years ];

  return defaultColumns;
});

const firstColumnHeaders = () => [ 'indicator', 'unit' ];

const narrowColumns = createSelector(parseChartData, data => {
  if (!data || isEmpty(data)) return null;

  return [ 'unit' ] + data.map(dt => dt.x);
});

const getTableData = createSelector(
  [
    getSelectedModel,
    getDefaultColumns,
    getIndicatorData,
    parseChartData,
    getSelectedOptions,
    getUnit,
    getTranslate
  ],
  (model, columns, indicatorData, parsedData, options, unit, t) => {
    if (!parsedData || !options || !unit || !model) return null;

    const filteredData = filteredDataBySelectedOptions(
      model,
      indicatorData,
      options
    );

    const tableData = [];
    if (model === KABUPATEN) {
      filteredData.forEach(data => {
        const objectData = {};

        objectData.indicator = data.location;
        objectData.unit = upperFirst(t(`common.unit.${unit}`));

        data.values.forEach(value => {
          objectData[value.year] = getTableValueFormat(unit, value.value);
        });

        tableData.push(objectData);
      });
    }

    if (model === SEKTOR) {
      filteredData.forEach(data => {
        const objectData = {};

        objectData.indicator = data.category;
        objectData.unit = upperFirst(t(`common.unit.${unit}`));

        data.values.forEach(value => {
          objectData[value.year] = getTableValueFormat(unit, value.value);
        });

        tableData.push(objectData);
      });
    }

    return tableData;
  }
);

const getSources = createSelector(
  [ getSelectedModel, getIndicatorData, getSelectedOptions ],
  (model, data, options) => {
    if (isEmpty(data) || isUndefined(data) || !model || !options) return [];

    const filteredData = filteredDataBySelectedOptions(model, data, options);

    if (!filteredData) return [];

    return uniq(filteredData.map(o => o.source));
  }
);

const getChartLoading = ({ provinceMeta = {}, indicators = {} }) =>
  provinceMeta && provinceMeta.loading || indicators && indicators.loading;

const getDataLoading = createSelector(
  [ getChartLoading, parseChartData ],
  (loading, data) => loading || !data || false
);

export const getTableConfig = createStructuredSelector({
  defaultColumns: getDefaultColumns,
  firstColumnHeaders,
  narrowColumns
});

export const getChartData = createStructuredSelector({
  data: parseChartData,
  config: getChartConfig,
  loading: getDataLoading,
  dataOptions: getLegendDataOptions,
  dataSelected: getLegendDataSelected
});

export const getEconomies = createStructuredSelector({
  indicatorParams: getIndicatorParams,
  chartData: getChartData,
  tableData: getTableData,
  tableConfig: getTableConfig,
  selectedOptions: getSelectedOptions,
  filterOptions: getFilterOptions,
  query: getQuery,
  allSelectedOption: getAllSelectedOption,
  provinceISO: getProvince,
  t: getTranslate,
  selectedModel: getSelectedModel,
  metadataParams: getMetadataParams,
  sources: getSources
});
