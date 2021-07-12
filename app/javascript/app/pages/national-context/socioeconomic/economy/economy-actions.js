/*
  filename: economy-actions.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { createAction } from 'redux-tools';
import { NATIONAL_CONTEXT } from 'router';

export const updateFiltersSelected = createAction(NATIONAL_CONTEXT);
