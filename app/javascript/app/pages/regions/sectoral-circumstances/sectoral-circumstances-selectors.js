/*
  filename: sectoral-circumtances-selectors.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { getTranslate } from 'selectors/translation-selectors';
import { getProvince } from 'selectors/provinces-selectors';
import { createSelector, createStructuredSelector } from 'reselect';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import uniq from 'lodash/uniq';
import { getThemeConfig, getTooltipConfig } from 'utils/graphs';
import flatten from 'lodash/flatten';

const humanize = string => upperFirst(string.split('_').join(' '));

const CHART_COLORS = [ '#FC7E4B', '#2EC9DF', '#0845CB' ];

const getAllIndicators = ({ indicators }) => indicators && indicators.data;

const getIndicators = indicatorCode =>
  createSelector(getAllIndicators, indicators => {
    if (!indicators) return null;

    return indicators.values &&
      indicators.values.filter(ind => ind.indicator_code === indicatorCode);
  });

const getIndicatorsPerProvince = indicatorCode =>
  createSelector([ getIndicators(indicatorCode), getProvince ], (
    indicators,
    provinceIso
  ) =>
    {
      if (!indicators || !provinceIso) return null;

      return indicators
        .filter(ind => ind.location_iso_code3 === provinceIso)
        .map(ind => ({
          ...ind,
          category: ind.category || humanize(ind.indicator_code)
        })); // if category is null, use indicator_code
    });

const getUniqueYears = indicatorCode =>
  createSelector(getIndicatorsPerProvince(indicatorCode), data => {
    if (!data) return null;

    const allYears = flatten(
      data
        .map(d => d.values)
        .map(arr => arr.map(o => o.year))
    );
    return [ ...new Set(allYears) ];
  });

const getDataForChart = indicatorCode =>
  createSelector(
    [ getUniqueYears(indicatorCode), getIndicatorsPerProvince(indicatorCode) ],
    (years, indicatorsData) => {
      if (!years || !indicatorsData) return null;

      const data = years.map(year => {
        const yValues = {};
        indicatorsData.forEach(({ values, category }) => {
          const valueForYear = values.find(o => o.year === year);
          const yKey = `y${upperFirst(camelCase(category))}`;
          const yValue = valueForYear && valueForYear.value;
          yValues[yKey] = yValue || undefined;
        });
        return { x: year, ...yValues };
      });

      return data;
    }
  );

const getYColumnOptions = indicatorCode =>
  createSelector(getIndicatorsPerProvince(indicatorCode), indicators => {
    if (!indicators) return null;

    return indicators.map(({ category }) => ({
      label: upperFirst(category),
      value: `y${upperFirst(camelCase(category))}`
    }));
  });

const getIndicatorMeta = indicatorCode =>
  createSelector(getAllIndicators, indicators => {
    if (!indicators) return null;

    return indicators.indicators &&
      indicators.indicators.find(ind => ind.code === indicatorCode);
  });

const getUnit = indicatorCode =>
  createSelector(getIndicatorMeta(indicatorCode), indicatorMeta => {
    if (!indicatorMeta) return null;

    return indicatorMeta.unit;
  });

const getIndicatorName = indicatorCode =>
  createSelector(getIndicatorMeta(indicatorCode), indicatorMeta => {
    if (!indicatorMeta) return null;
    return indicatorMeta.name;
  });

const getDomain = createSelector(() => ({
  x: [ 'auto', 'auto' ],
  y: [ 0, 'auto' ]
}));

const getChartConfig = (indicatorCode, chartColors) =>
  createSelector(
    [
      getYColumnOptions(indicatorCode),
      getUnit(indicatorCode),
      getTranslate,
      getIndicatorName(indicatorCode)
    ],
    (yColumnOptions, unit, t, indicatorName) => {
      if (!yColumnOptions || !unit || !t || !indicatorName) return null;

      const axes = {
        xBottom: {
          name: t('common.years-label'),
          unit: t('common.years-label')
        },
        yLeft: {
          name: indicatorName,
          unit: unit === 'thousand of heads' ? 'k' : upperFirst(unit),
          unitTooltip: upperFirst(unit),
          label: indicatorName
        }
      };

      const tooltip = getTooltipConfig(yColumnOptions);

      return {
        axes,
        tooltip,
        animation: false,
        theme: getThemeConfig(yColumnOptions, null, chartColors),
        columns: {
          x: [ { label: t('common.years-label'), value: 'x' } ],
          y: yColumnOptions
        }
      };
    }
  );

const getChartData = (indicatorCode, chartColors) =>
  createStructuredSelector({
    data: getDataForChart(indicatorCode),
    config: getChartConfig(indicatorCode, chartColors),
    dataOptions: getYColumnOptions(indicatorCode),
    dataSelected: getYColumnOptions(indicatorCode),
    domain: getDomain
  });

const getSources = indicatorCode =>
  createSelector(getIndicators(indicatorCode), indicators => {
    if (!indicators || !indicators.length) return [];

    return uniq(indicators.map(i => i.source));
  });

const getDownloadURI = indicatorCode =>
  createSelector(
    [ getProvince, getSources(indicatorCode) ],
    (provinceISO, sources) =>
      `indicators.zip?location=${provinceISO}&code=${indicatorCode}&source=${sources.join(
        ','
      )}`
  );

export const getIndicatorsData = (indicatorCode, chartColors = CHART_COLORS) =>
  createStructuredSelector({
    t: getTranslate,
    indicatorName: getIndicatorName(indicatorCode),
    sources: getSources(indicatorCode),
    downloadURI: getDownloadURI(indicatorCode),
    chartData: getChartData(indicatorCode, chartColors)
  });

export const getSectoralCircumstances = createStructuredSelector({
  t: getTranslate
});
