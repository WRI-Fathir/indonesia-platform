// slug
export const NO_DATA = 'no-data';

export const ADAPTATION_CODE = 'Adap_13';

export const EMISSIONS_UNIT = `ktCO<sub>2</sub>e`;
export const EMISSIONS_UNIT_NO_HTML = 'ktCO2e';

// not present in the API
export const PRIMARY_SOURCE_OF_EMISSION_INDICATOR = 'primary-source-of-emissions';

// colors for sections
export const SECTION_COLORS = {
  WASTE: '#06214C',
  AGRICULTURE: '#FC7E4B',
  ENERGY: '#2EC9DF',
  FORESTRY: '#FCA683',
  INDUSTRIAL_PROCESS_AND_PRODUCT_USE: '#FFC735',
  'no-data': '#868697'
};

// colors for activities
export const MAP_BUCKET_COLORS = [
  '#FFFFFF',
  '#B3DDF8',
  '#3AA2E0',
  '#297CB8',
  '#064584'
];

// colors for adaptation
export const YES_NO_COLORS = { no: '#001880', yes: '#2EC9DF' };

export const ISOS_NOT_ALLOWED = [ 'IDN' ];

export const getMapStyles = color => ({
  default: {
    fill: color,
    fillOpacity: 1,
    stroke: '#ffffff',
    strokeWidth: 0.2,
    outline: 'none'
  },
  hover: { fill: color, stroke: '#ffffff', strokeWidth: 0.6, outline: 'none' },
  pressed: { fill: color, stroke: '#ffffff', strokeWidth: 0.2, outline: 'none' }
});

export const LOCATION_ISO_CODE = 'location_iso_code3';
