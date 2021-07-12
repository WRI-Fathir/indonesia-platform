/*
  filename: population-map-actions.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createAction } from 'redux-tools';
import { REGIONS } from 'router';

export const linkToDistrict = createAction(REGIONS);
