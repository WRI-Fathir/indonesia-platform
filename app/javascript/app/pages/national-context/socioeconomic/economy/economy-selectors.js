import { createStructuredSelector, createSelector } from 'reselect';
import { getTranslate } from 'selectors/translation-selectors';
import sortBy from 'lodash/sortBy';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import uniq from 'lodash/uniq';
import {
  getThemeConfig,
  getTooltipConfig,
  getUniqueYears,
  setLegendOptions,
  CHART_COLORS
} from 'utils/graphs';
import { format } from 'd3-format';

import {
  getQuery,
  getIndicatorsData,
  getNationalIndicators,
  getXColumn,
  getDomain,
  getAxes
} from '../population/population-selectors';

const getSelectedIndicatorCode = createSelector(getQuery, query => {
  if (!query || !query.gdpNationalIndicator) return 'GDP_price';
  return query.gdpNationalIndicator;
});

const getNationalIndicatorsForEconomy = createSelector(
  [ getNationalIndicators ],
  indicators => {
    if (!indicators) return null;
    return indicators.filter(ind => ind.indicator_code.includes('GDP_'));
  }
);

const getEconomyIndicatorsValues = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;
    return indicators.values &&
      indicators.values.filter(ind => ind.indicator_code.includes('GDP_'));
  }
);

const getEconomyIndicatorsMetadata = createSelector(
  [ getIndicatorsData ],
  indicators => {
    if (!indicators) return null;
    return indicators.indicators &&
      indicators.indicators.filter(ind => ind.code.includes('GDP_'));
  }
);

const getSelectedIndicatorsValues = createSelector(
  [ getEconomyIndicatorsValues, getSelectedIndicatorCode ],
  (indicators, selectedIndicatorCode) => {
    if (!indicators) return null;
    return indicators.filter(
      ind => ind.indicator_code === selectedIndicatorCode
    );
  }
);

const getIndicatorsOptions = createSelector(
  [ getEconomyIndicatorsMetadata ],
  indicators => {
    if (!indicators) return null;
    return sortBy(
      indicators.map(ind => ({ label: ind.name, value: ind.code })),
      'label'
    );
  }
);

const getSelectedIndicator = createSelector(
  [ getEconomyIndicatorsMetadata, getSelectedIndicatorCode ],
  (indicators, code) => {
    if (!indicators) return null;
    const indicator = indicators.find(i => i.code === code);
    return {
      value: indicator.code,
      label: indicator.name,
      unit: indicator.unit
    };
  }
);

const getProvincesSelectionOptions = createSelector(
  getSelectedIndicatorsValues,
  selectedIndicatorValues => {
    if (!selectedIndicatorValues) return null;
    return selectedIndicatorValues.map(i => ({
      label: i.location,
      value: i.location_iso_code3
    }));
  }
);

const getSelectedProvinces = createSelector(
  [ getQuery, getProvincesSelectionOptions ],
  (query, options) => {
    if (!options) return null;
    if (!query || !query.gdpProvince)
      return [ { value: options[0].value, label: options[0].label } ];
    const queryArray = query.gdpProvince.split(',');
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

const getYColumn = data => data.map(d => ({ label: d.label, value: d.key }));

// Y LABEL FORMATS
const getCustomYLabelFormat = unit => {
  const formatY = {
    'billion Rupiahs': value => format('.3~s')(value * 1000).replace(/G/, 'B'),
    'million Rupiahs': value => `${value}M`,
    '%': value => `${value}%`
  };
  return formatY[unit];
};

const getCustomUnit = unit => {
  const formatY = {
    'billion Rupiahs': 'Rupiahs',
    'million Rupiahs': 'Rupiahs',
    '%': 'Percentage'
  };
  return formatY[unit] || unit;
};

const getChartData = createSelector(
  [
    getNationalIndicatorsForEconomy,
    getChartRawData,
    getChartXYvalues,
    getProvincesSelectionOptions,
    getSelectedProvinces,
    getSelectedIndicator
  ],
  (
    indicators,
    rawData,
    chartXYvalues,
    provincesOptions,
    selectedProvinces,
    selectedIndicator
  ) =>
    {
      if (!indicators) return null;
      const unit = selectedIndicator && selectedIndicator.unit;

      const yLabelTooltip = getCustomUnit(unit);
      const theme = getThemeConfig(getYColumn(rawData, CHART_COLORS));

      return {
        data: chartXYvalues,
        domain: getDomain(),
        config: {
          axes: getAxes('Years', 'GDP'),
          tooltip: {
            ...getTooltipConfig(getYColumn(rawData)),
            x: { label: 'Year' },
            indicator: yLabelTooltip,
            theme,
            formatFunction: getCustomYLabelFormat(unit)
          },
          animation: false,
          columns: { x: getXColumn(), y: getYColumn(rawData) },
          theme,
          yLabelFormat: getCustomYLabelFormat(unit)
        },
        dataOptions: setLegendOptions(provincesOptions, selectedProvinces),
        dataSelected: selectedProvinces
      };
    }
);

const getSources = createSelector(
  [ getNationalIndicatorsForEconomy ],
  iValues => uniq((iValues || []).map(i => i.source))
);

const getIndicatorCodes = createSelector(
  [ getNationalIndicatorsForEconomy ],
  iValues => uniq((iValues || []).map(i => i.indicator_code))
);

const getDownloadURI = createSelector(
  [ getSources, getIndicatorCodes ],
  (sources, indicatorCodes) =>
    `indicators.zip?code=${indicatorCodes.join(',')}&source=${sources.join(
      ','
    )}`
);

export const getEconomy = createStructuredSelector({
  t: getTranslate,
  query: getQuery,
  chartData: getChartData,
  indicatorOptions: getIndicatorsOptions,
  selectedIndicator: getSelectedIndicator,
  sources: getSources,
  downloadURI: getDownloadURI
});
