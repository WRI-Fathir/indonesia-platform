import { createAction } from 'redux-tools';
import { REGIONS } from 'router';

export const updateFiltersSelected = createAction(REGIONS);
