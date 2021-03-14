export default [
  {
    slug: 'regions-ghg-emissions',
    path: '/:locale/regions/:region/regions-ghg-emissions',
    exact: true,
    province: true,
    member: 'all',
    default: true,
  },
  {
    slug: 'sectoral-circumstances',
    path: '/:locale/regions/:region/sectoral-circumstances',
    member: 'all',
    exclude: 'ID.PB',
    province: true,
  },
  {
    slug: 'climate-sectoral-plan',
    path: '/:locale/regions/:region/sectoral-plan',
    member: 'all',
    exclude: 'ID.PB',
    province: true,
  },
  {
    slug: 'region-population',
    path: '/:locale/regions/:region/region-population',
    member: 'ID.PB',
    province: true,
  },
  {
    slug: 'economy',
    path: '/:locale/regions/:region/economy',
    member: 'ID.PB',
    province: true,
  },
  {
    slug: 'social',
    path: '/:locale/regions/:region/social',
    member: 'ID.PB',
    province: true,
  },
]
