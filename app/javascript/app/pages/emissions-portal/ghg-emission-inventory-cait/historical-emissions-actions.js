/*
  filename: historical-emissions-actions.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createAction } from 'redux-tools';
import { EMISSIONS_PORTAL } from 'router';

export const updateFiltersSelected = createAction(EMISSIONS_PORTAL);
