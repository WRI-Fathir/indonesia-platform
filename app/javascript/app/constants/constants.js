export const ALL_SELECTED = 'all-selected';

export const API_TARGET_DATA_SCALE = 1000;
export const METRIC_OPTIONS = {
  ABSOLUTE_VALUE: 'absolute',
  PER_CAPITA: 'per_gdp',
  PER_GDP: 'per_capita'
};
export const METRIC = {
  absolute: 'ABSOLUTE_VALUE',
  per_capita: 'EMISSION_PER_CAPITA',
  per_gdp: 'EMISSION_PER_GDP'
};
export const API = { cw: 'CW', indo: 'INDO' };
export const EMISSION_TARGET = { bau: 'BAU', target: 'TARGET' };
export const SOURCE = { SIGN_SMART: 'SIGNSa', CAIT: 'CAIT' };
export const SECTOR_TOTAL = 'TOTAL';
export const NDC_LINKS_OPTIONS = [
  { value: 'ndc', label: 'NDC (EN)' },
  { value: 'indc', label: 'INDC (EN)' }
];

export const WEST_PAPUA = { label: 'West Papua', code: 'ID.PB', value: 'ID.PB' }
export const SELECT_ALL = { label: 'All Selected', code: 'all-selected', value: 'all-selected' }