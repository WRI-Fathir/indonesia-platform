/*
  filename: population-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createStructuredSelector, createSelector } from 'reselect';
import { getTranslate } from 'selectors/translation-selectors';
import { format } from 'd3-format';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import sortBy from 'lodash/sortBy';
import castArray from 'lodash/castArray';
import { findOption } from 'selectors/filters-selectors';
import {
  getThemeConfig,
  getTooltipConfig,
  getUniqueYears,
  setLegendOptions,
  CHART_COLORS
} from 'utils/graphs';

const POPULATION_INDICATOR_CODES = [
  'pop_total',
  'pop_growth',
  'lit_rate',
  'poor_people'
];

const maxChartLegendElements = 5;
// shared with energy and economy selectors (to be moved to a shared folder)
export const getQuery = ({ location }) => location && location.query || null;

export const getIndicatorsData = ({ indicators }) =>
  indicators && indicators.data;

export const getNationalIndicators = createSelector(
  [ getIndicatorsData ],
  nationalIndicators => {
    if (!nationalIndicators) return null;

    return nationalIndicators.values &&
      nationalIndicators.values.filter(
        ind => ind.location_iso_code3 === COUNTRY_ISO
      );
  }
);

export const getFirstChartFilter = (queryName, selectedOptions) => {
  const label = selectedOptions[queryName] && selectedOptions[queryName].label;

  return [ { label } ];
};

export const getXColumn = () => [ { label: 'year', value: 'x' } ];

export const getDomain = () => ({ x: [ 'auto', 'auto' ], y: [ 0, 'auto' ] });

export const getAxes = (xName, yName) => ({
  xBottom: { name: xName, unit: '', format: 'string' },
  yLeft: { name: yName, unit: '', format: 'number' }
});

// end of shared
const DATA_SCALE = 1000;

const { COUNTRY_ISO } = process.env;

// Y LABEL FORMATS
const getCustomYLabelFormat = unit => {
  const formatY = {
    thousand: value => `${format('.3s')(`${value * DATA_SCALE}`)}`,
    '%': value => `${value}%`
  };
  return formatY[unit];
};

const getYColumn = data => data.map(d => ({ label: d.label, value: d.key }));

const getSelectedIndicatorCode = createSelector(getQuery, query => {
  if (!query || !query.popNationalIndicator) return 'pop_total';
  return query.popNationalIndicator;
});

const getPopulationIndicatorsValues = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;

    return indicators.values &&
      POPULATION_INDICATOR_CODES.map(
        indCode =>
          indicators.values.filter(ind => ind.indicator_code === indCode)
      );
  }
);

const getPopulationIndicatorsMetadata = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;
    return indicators.indicators &&
      POPULATION_INDICATOR_CODES.map(
        indCode => indicators.indicators.filter(ind => ind.code === indCode)
      );
  }
);

const getSelectedIndicatorsValues = createSelector(
  [ getPopulationIndicatorsValues, getSelectedIndicatorCode ],
  (indicators, selectedIndicatorCode) => {
    if (!indicators) return null;
    if (isEmpty(indicators[0])) return null;

    return indicators.find(
      ind => ind[0].indicator_code === selectedIndicatorCode
    );
  }
);

const getSelectedIndicator = createSelector(
  [ getPopulationIndicatorsMetadata, getSelectedIndicatorCode ],
  (indicators, selectedIndicatorCode) => {
    if (!indicators) return null;
    if (isEmpty(indicators[0])) return null;

    const selectedIndicator = indicators.find(
      ind => ind[0].code === selectedIndicatorCode
    );

    return {
      value: selectedIndicator[0].code,
      label: selectedIndicator[0].name,
      unit: selectedIndicator[0].unit
    };
  }
);

const getProvincesSelectionOptions = createSelector(
  getSelectedIndicatorsValues,
  selectedIndicatorValues => {
    if (!selectedIndicatorValues) return null;
    const sortedIndicatorValues = sortBy(selectedIndicatorValues, 'location')

    return sortedIndicatorValues.map(i => ({
      label: i.location,
      value: i.location_iso_code3
    }));
  }
);

const getSelectedProvinces = createSelector(
  [ getQuery, getProvincesSelectionOptions ],
  (query, options) => {
    if (!options) return null;
    if (!query || !query.popProvince)
      return castArray(findOption(options, 'IDN'))
    const queryArray = query.popProvince.split(',');
    const provincesSelected = queryArray.map(q => {
      const provincesData = options.find(o => o.value === q);
      return provincesData &&
        { label: provincesData.label, value: provincesData.value };
    });
    return provincesSelected;
  }
);

const getChartRawData = createSelector(
  [ getSelectedIndicatorsValues, getSelectedProvinces ],
  (selectedIndicatorValues, selectedProvinces) => {
    if (!selectedIndicatorValues) return null;

    return selectedProvinces.map(st => {
      const provinceData = selectedIndicatorValues.find(
        i => i.location_iso_code3 === st.value
      );
      return {
        values: provinceData.values,
        key: provinceData.category
          ? `y${upperFirst(camelCase(provinceData.category))}`
          : `y${upperFirst(camelCase(provinceData.location_iso_code3))}`,
        label: provinceData.category
          ? `${upperFirst(provinceData.category)}`
          : provinceData.location,
        id: provinceData.location_iso_code3,
        value: provinceData.location_iso_code3,
        category: provinceData.category &&
          `y${upperFirst(camelCase(provinceData.category))}`
      };
    });
  }
);

const getChartXYvalues = createSelector(getChartRawData, rawData => {
  if (!rawData) return null;
  return getUniqueYears(rawData).map(year => {
    const yValues = {};
    rawData.forEach(({ values, key }) => {
      const valueForYear = values.find(o => o.year === year);
      yValues[key] = valueForYear && valueForYear.value || undefined;
    });
    return { x: parseInt(year, 10), ...yValues };
  });
});

const getNationalIndicatorsForPopulationOptions = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;

    const options = [];

    POPULATION_INDICATOR_CODES.forEach(indicatorCode => {
      const indicator = indicators &&
        indicators.indicators &&
        indicators.indicators.find(ind => ind.code === indicatorCode) ||
        null;
      if (indicator) {
        options.push({ label: indicator.name, value: indicator.code });
      }
    });

    return sortBy(options, 'label');
  }
);

const unitLabels = { thousand: 'People', '%': 'Percentage' };

const getBarChartData = createSelector(
  [
    getSelectedProvinces,
    getProvincesSelectionOptions,
    getChartRawData,
    getChartXYvalues,
    getSelectedIndicator
  ],
  (
    selectedProvinces,
    selectionOptions,
    chartRawData,
    chartXYvalues,
    indicator
  ) =>
    {
      if (!chartRawData) return null;

      const unit = indicator && indicator.unit;

      const theme = getThemeConfig(getYColumn(chartRawData, CHART_COLORS));
      return {
        data: chartXYvalues,
        domain: getDomain(),
        config: {
          axes: getAxes('Year', 'People'),
          tooltip: {
            ...getTooltipConfig(getYColumn(chartRawData)),
            x: { label: 'Year' },
            indicator: unitLabels[unit] ? unitLabels[unit] : unit,
            theme,
            formatFunction: getCustomYLabelFormat(unit)
          },
          animation: false,
          columns: { x: getXColumn(), y: getYColumn(chartRawData) },
          theme,
          yLabelFormat: getCustomYLabelFormat(unit)
        },
        dataOptions: setLegendOptions(
          selectionOptions,
          selectedProvinces,
          maxChartLegendElements
        ),
        dataSelected: selectedProvinces
      };
    }
);

const getFirstChartIndicatorsValues = createSelector(
  [ getIndicatorsData ],
  indicatorsData => {
    if (!indicatorsData || !indicatorsData.values) return [];

    return indicatorsData.values.filter(
      i => POPULATION_INDICATOR_CODES.includes(i.indicator_code)
    );
  }
);
const getSources = createSelector(
  [ getFirstChartIndicatorsValues ],
  iValues => uniq(iValues.map(i => i.source))
);
const getIndicatorCodes = createSelector(
  [ getFirstChartIndicatorsValues ],
  iValues => uniq(iValues.map(i => i.indicator_code))
);
const getDownloadURI = createSelector(
  [ getSources, getIndicatorCodes ],
  (sources, indicatorCodes) =>
    `indicators.zip?code=${indicatorCodes.join(',')}&source=${sources.join(
      ','
    )}`
);

export const getPopulation = createStructuredSelector({
  t: getTranslate,
  chartData: getBarChartData,
  query: getQuery,
  nationalIndicatorsOptions: getNationalIndicatorsForPopulationOptions,
  selectedIndicator: getSelectedIndicator,
  sources: getSources,
  downloadURI: getDownloadURI
});
