import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

export const DEFAULT_AXES_CONFIG = {
  xBottom: { name: 'Year', unit: 'date', format: 'YYYY' },
  yLeft: { name: 'Emissions', unit: 'CO<sub>2</sub>e', format: 'number' }
};

export const getColumns = data =>
  Object.keys(data[0]).map(d => ({ label: data[0][d].label, value: d }));

export const getColumnValue = column => upperFirst(camelCase(column));
export const getYColumnValue = column => `y${getColumnValue(column)}`;

export const getTooltipConfig = columns => {
  const tooltip = {};
  (columns || []).forEach(column => {
    tooltip[column.value] = { label: column.label };
  });
  return tooltip;
};

export const CHART_COLORS =[
  '#3bc0c6',
  '#5144d3',
  '#e8871a',
  '#da3490',
  '#9089fb',
  '#49e26f',
  '#2780eb',
  '#6f38b1',
  '#dfbf01',
  '#cb6f10',
  '#2a8d6c',
  '#9bec54'
]

export const getThemeConfig = (
  columns,
  colorCache = {},
  colors = CHART_COLORS
) =>
  {
    const theme = {};
    let newColumns = columns;
    let usedColors = [];
    if (colorCache && !isEmpty(colorCache)) {
      const usedColumns = columns.filter(c => colorCache[c.value]);
      usedColors = uniq(usedColumns.map(c => colorCache[c.value].stroke));
      newColumns = columns.filter(c => !usedColumns.includes(c.value));
    }
    const themeUsedColors = [];
    let availableColors = colors.filter(c => !usedColors.includes(c));
    newColumns.forEach((column, i) => {
      availableColors = availableColors.filter(
        c => !themeUsedColors.includes(c)
      );
      if (!availableColors.length) availableColors = colors;
      let index;
      if (column.index || column.index === 0) {
        index = { column };
      } else {
        index = i % availableColors.length;
        themeUsedColors.push(selectedColor);
      }
      const selectedColor = availableColors[index];
      theme[column.value] = { stroke: selectedColor, fill: selectedColor };
    });
    return { ...theme, ...colorCache };
  };

export const getUniqueYears = data => {
  const allYears = flatten(
    data
      .map(d => d.values)
      .map(arr => arr.map(o => o.year))
  );
  return [ ...new Set(allYears) ];
};

export const setLegendOptions = (options, selected, maxLegendElements) => {
  if (!maxLegendElements) return options;
  const placehyolderArray = new Array(maxLegendElements);
  if (selected && selected.length === maxLegendElements)
    return placehyolderArray;
  return options;
};
