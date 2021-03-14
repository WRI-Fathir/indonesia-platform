import { feature } from 'topojson-client';

import topojson from './papua_barat.json';

const paths = feature(
  topojson,
  topojson.objects[Object.keys(topojson.objects)]
).features;

export default paths;
