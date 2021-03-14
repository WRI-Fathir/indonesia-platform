import { connectRoutes, NOT_FOUND, redirect } from 'redux-first-router';
import createHistory from 'history/createBrowserHistory';
import queryString from 'query-string';
import { DEFAULT_LANGUAGE, LANGUAGES_AVAILABLE } from 'constants/languages';

import RegionsSelect from 'components/regions-select';
import NationalSections from './sections/national-context';
import ClimateGoalsSections from './sections/climate-goals';
import RegionsSections from './sections/regions';
import EmissionsSections from './sections/emissions-portal';

const history = createHistory();
const AVAILABLE_LOCALES = LANGUAGES_AVAILABLE.map(lang => lang.value);

export const HOME = 'location/HOME';
export const NATIONAL_CONTEXT = 'location/NATIONAL_CONTEXT';
export const CLIMATE_GOALS = 'location/CLIMATE_GOALS';
export const REGIONS = 'location/REGIONS';
export const EMISSIONS_PORTAL = 'location/EMISSIONS_PORTAL';

export const routes = {
  [HOME]: {
    nav: false,
    label: 'Overview',
    path: '/:locale?',
    module: '/',
    component: 'pages/home/home'
  },
  [NATIONAL_CONTEXT]: {
    nav: true,
    label: 'National Context',
    slug: 'national-context',
    link: '/national-context',
    path: '/:locale?/national-context/:section?',
    module: '/national-context',
    component: 'layouts/sections/sections',
    sections: NationalSections
  },
  [CLIMATE_GOALS]: {
    nav: true,
    label: 'Climate Goals',
    slug: 'climate-goals',
    link: '/climate-goals',
    path: '/:locale?/climate-goals/:section?',
    module: '/climate-goals',
    component: 'layouts/sections/sections',
    sections: ClimateGoalsSections
  },
  [REGIONS]: {
    nav: true,
    navNestedMenu: true,
    label: 'Province Module',
    slug: 'regions',
    link: '/regions',
    path: '/:locale?/regions/:region?/:section?',
    module: '/regions',
    component: 'layouts/sections/sections',
    sections: RegionsSections,
    Child: RegionsSelect
  },
  [EMISSIONS_PORTAL]: {
    nav: true,
    slug: 'emissions-portal',
    label: 'Emissions Portal',
    link: '/emissions-portal',
    path: '/:locale?/emissions-portal/:section?',
    module: '/emissions-portal',
    component: 'layouts/sections/sections',
    sections: EmissionsSections
  },
  [NOT_FOUND]: {
    path: '/404',
    thunk: dispatch => {
      dispatch(
        redirect({ type: 'HOME', payload: { locale: DEFAULT_LANGUAGE } })
      );
    }
  }
};
const onBeforeChange = (dispatch, getState, { action }) => {
  const { locale } = action.payload;

  const { type } = action;
  const language = getState().location.payload.locale || DEFAULT_LANGUAGE;

  if (!AVAILABLE_LOCALES.includes(locale)) {
    dispatch(
      redirect({ type, payload: { ...action.payload, locale: language } })
    );
  }
};
export default connectRoutes(history, routes, {
  querySerializer: queryString,
  onBeforeChange
});
