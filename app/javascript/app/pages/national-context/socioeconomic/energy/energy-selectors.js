import { createStructuredSelector, createSelector } from 'reselect';
import capitalize from 'lodash/capitalize';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import { format } from 'd3-format';
import { getTranslate } from 'selectors/translation-selectors';

import { getThemeConfig, getTooltipConfig } from 'utils/graphs';

import {
  getIndicatorsData,
  getQuery
} from '../population/population-selectors';

const { COUNTRY_ISO } = process.env;
const SUPPLY_ENERGY_CODE = 'supply_energy';
const DEFAULT_INDICATOR_CODE = SUPPLY_ENERGY_CODE;
const ENERGY_INDICATORS = [ SUPPLY_ENERGY_CODE, 'ins_power', 'elec_ratio' ];

const INDICATOR_QUERY_NAME = 'energyInd';
const CATEGORIES_QUERY_NAME = 'categories';

export const AXES_CONFIG = (yName, yUnit) => ({
  xBottom: { name: 'Year', unit: 'Date', format: 'YYYY' },
  yLeft: { name: yName, unit: yUnit, format: 'number' }
});

const getEnergyData = createSelector([ getIndicatorsData ], indicators => {
  if (!indicators) return null;

  return indicators.values &&
    indicators.values.filter(
      ind =>
        ENERGY_INDICATORS.includes(ind.indicator_code) &&
          ind.location_iso_code3 === COUNTRY_ISO
    );
});

const getEnergyIndicators = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;

    return indicators &&
      indicators.indicators &&
      indicators.indicators.filter(ind => ENERGY_INDICATORS.includes(ind.code));
  }
);

const getOptions = createSelector([ getEnergyIndicators ], energyIndicators => {
  if (!energyIndicators) return null;

  return energyIndicators.map(e => ({ label: e.name, value: e.code }));
});

const getDefaultCategories = createSelector(
  [ getEnergyData, getEnergyIndicators ],
  (energyData, energyIndicators) => {
    if (!energyData || !energyIndicators) return null;

    const defaultCategories = {};
    ENERGY_INDICATORS.forEach(indicator => {
      const data = energyData.filter(e => e.indicator_code === indicator);
      defaultCategories[indicator] = [];
      data.forEach(
        d =>
          defaultCategories[indicator].push({
            label: capitalize(d.category) ||
              energyIndicators.find(e => e.code === indicator).name,
            value: d.category || indicator
          })
      );
    });

    return defaultCategories;
  }
);

const getFilterOptions = createSelector([ getOptions, getDefaultCategories ], (
  options,
  categories
) => ({
  [INDICATOR_QUERY_NAME]: options,
  [CATEGORIES_QUERY_NAME]: categories
}));

const getDefaults = createSelector([ getOptions, getDefaultCategories ], (
  options,
  defaultCategories
) => ({
  [INDICATOR_QUERY_NAME]: options &&
    options.find(o => o.value === DEFAULT_INDICATOR_CODE),
  [CATEGORIES_QUERY_NAME]: defaultCategories
}));

const findOption = (options, value) =>
  options && options.find(o => o.value === value || o.name === value);

const getFieldSelected = field => state => {
  const { query } = state.location;

  const categoriesField = field === CATEGORIES_QUERY_NAME;
  const categoriesInQuery = query && query[CATEGORIES_QUERY_NAME];
  const indicatorInQuery = query && query[INDICATOR_QUERY_NAME];

  if (categoriesField && !query)
    return getDefaults(state)[field] &&
      getDefaults(state)[field][DEFAULT_INDICATOR_CODE];
  if (categoriesField && indicatorInQuery && !categoriesInQuery) {
    return getDefaults(state)[field] &&
      getDefaults(state)[field][query[INDICATOR_QUERY_NAME]];
  }
  if (categoriesField && !categoriesInQuery) {
    return getDefaults(state)[field] &&
      getDefaults(state)[field][DEFAULT_INDICATOR_CODE];
  }
  if (!query || !query[field]) return getDefaults(state)[field];
  const queryValue = query[field];

  const getFilterOptionsForCategories = (s, f) => {
    if (!query[INDICATOR_QUERY_NAME])
      return getFilterOptions(s)[f] &&
        getFilterOptions(s)[f][DEFAULT_INDICATOR_CODE];
    return getFilterOptions(s)[f] &&
      getFilterOptions(s)[f][query[INDICATOR_QUERY_NAME]];
  };

  const options = field === CATEGORIES_QUERY_NAME
    ? getFilterOptionsForCategories(state, field)
    : getFilterOptions(state)[field];

  const findSelectedOption = value => findOption(options, value);

  return queryValue.includes(',')
    ? queryValue.split(',').map(v => findSelectedOption(v))
    : findSelectedOption(queryValue);
};

const getSelectedOptions = createStructuredSelector({
  [INDICATOR_QUERY_NAME]: getFieldSelected(INDICATOR_QUERY_NAME),
  [CATEGORIES_QUERY_NAME]: getFieldSelected(CATEGORIES_QUERY_NAME)
});

const getYears = createSelector([ getEnergyData, getSelectedOptions ], (
  energyData,
  selectedOptions
) =>
  {
    if (!energyData) return null;

    const valuesCollected = energyData
      .filter(
        e => e.indicator_code === selectedOptions[INDICATOR_QUERY_NAME].value
      )
      .map(ind => ind.values);

    const years = valuesCollected[0]
      .filter(o => o.value)
      .map(o => o.year);
    return years;
  });

const getUnit = createSelector([ getSelectedOptions, getIndicatorsData ], (
  selectedOptions,
  indicators
) =>
  {
    if (!selectedOptions) return null;

    const indicator = selectedOptions[INDICATOR_QUERY_NAME];

    return indicators &&
      indicators.indicators &&
      indicators.indicators.find(ind => ind.code === indicator.value).unit;
  });

const getLegendDataSelected = createSelector(
  [ getSelectedOptions, getFilterOptions, getEnergyData ],
  (selectedOptions, options, energyData) => {
    if (!selectedOptions || !options || !energyData) return null;

    const dataSelected = selectedOptions[CATEGORIES_QUERY_NAME];

    return isArray(dataSelected) ? dataSelected : [ dataSelected ];
  }
);

const getYColumnOptions = createSelector(
  [ getLegendDataSelected ],
  legendDataSelected => {
    if (!legendDataSelected) return null;
    const getYOption = columns =>
      columns.map(d => ({ label: d && d.label, value: d && d.value }));

    return uniqBy(getYOption(legendDataSelected), 'value');
  }
);

const unitLabels = { '%': 'Percentage' };

const getChartData = createSelector(
  [
    getSelectedOptions,
    getEnergyData,
    getYears,
    getYColumnOptions,
    getLegendDataSelected,
    getUnit,
    getFilterOptions
  ],
  (
    selectedOptions,
    energyData,
    years,
    yColumns,
    legendDataSelected,
    unit,
    filterOptions
  ) =>
    {
      if (
        !selectedOptions || !energyData || !years || !yColumns || !filterOptions
      )
        return null;

      const indicator = selectedOptions[INDICATOR_QUERY_NAME];

      const filteredEnergyDataByIndicator = energyData.filter(
        d => d.indicator_code === indicator.value
      );

      const chartType = indicator.value === SUPPLY_ENERGY_CODE ? 'bar' : 'line';

      const categories = filteredEnergyDataByIndicator.map(e => ({
        label: capitalize(e.category) || indicator.name,
        value: e.category || indicator.value
      }));

      const selectedData = [];

      if (yColumns && filteredEnergyDataByIndicator && years) {
        years.forEach(year => {
          const dataForYear = { x: parseInt(year, 10) };
          yColumns.forEach(category => {
            const singleCategory = filteredEnergyDataByIndicator.find(
              // if category is null, get indicator_code
              e =>
                e.category && e.category === category.value ||
                  e.indicator_code === category.value
            );
            if (singleCategory) {
              const categoryForYear = singleCategory.values.find(
                d => d.year === year
              );
              dataForYear[`y${capitalize(
                category.value
              )}`] = categoryForYear.value;
            }
          });
          selectedData.push(dataForYear);
        });
      }

      const configYColumns = yColumns.map(y => ({
        label: y.label,
        value: `y${capitalize(y.value)}`,
      }));

      const allYColumns = filterOptions[CATEGORIES_QUERY_NAME][indicator.value];
      const configAllYColumns = allYColumns.map(y => ({
        label: y.label,
        value: `y${capitalize(y.value)}`,
      }));

      const domainY = unit && unit === '%' ? [ 0, 100 ] : [ 0, 'auto' ];

      return {
        data: selectedData,
        domain: { x: [ 'auto', 'auto' ], y: domainY },
        config: {
          columns: { x: [ { label: 'year', value: 'x' } ], y: configYColumns },
          axes: AXES_CONFIG(indicator.name, unit),
          theme: getThemeConfig(configAllYColumns),
          tooltip: {
            ...getTooltipConfig(configYColumns),
            x: { label: 'Year' },
            indicator: unitLabels[unit] ? unitLabels[unit] : unit,
            theme: getThemeConfig(configAllYColumns)
          },
          animation: false,
          yLabelFormat: unit === '%'
            ? value => `${value}`
            : value => `${format(',')(value)}`
        },
        dataSelected: legendDataSelected,
        dataOptions: categories,
        type: chartType
      };
    }
);

const getSources = createSelector(
  [ getEnergyData ],
  iValues => uniq((iValues || []).map(i => i.source))
);

const getIndicatorCodes = createSelector(
  [ getEnergyData ],
  iValues => uniq((iValues || []).map(i => i.indicator_code))
);
const getDownloadURI = createSelector(
  [ getSources, getIndicatorCodes ],
  (sources, indicatorCodes) =>
    `indicators.zip?code=${indicatorCodes.join(',')}&source=${sources.join(
      ','
    )}`
);

export const getEnergy = createStructuredSelector({
  t: getTranslate,
  options: getOptions,
  years: getYears,
  chartData: getChartData,
  selectedOptions: getSelectedOptions,
  query: getQuery,
  sources: getSources,
  downloadURI: getDownloadURI
});
