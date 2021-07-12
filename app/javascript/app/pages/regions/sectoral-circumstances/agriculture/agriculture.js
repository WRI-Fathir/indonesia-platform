/*
  filename: agriculture.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';
import Component from './agriculture-component';
import { getIndicatorsData } from '../sectoral-circumstances-selectors';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = state => {
  const AREA_HARVESTED_INDICATOR_CODE = 'area_harvested';
  const LIVESTOCK_POP_INDICATOR_CODE = 'livestock_pop';

  const HARVESTED_AREA_CHART_COLORS = [ '#2EC9DF' ];
  const LIVESTOCK_POP_CHART_COLORS = [ '#FC7E4B' ];

  const getHarvestedAreaData = getIndicatorsData(
    AREA_HARVESTED_INDICATOR_CODE,
    HARVESTED_AREA_CHART_COLORS
  );
  const getLivestockPopData = getIndicatorsData(
    LIVESTOCK_POP_INDICATOR_CODE,
    LIVESTOCK_POP_CHART_COLORS
  );

  // eslint-disable-next-line no-shadow
  return state => ({
    t: getHarvestedAreaData(state).t,
    harvestedAreaChartData: getHarvestedAreaData(state).chartData,
    harvestedAreaIndicatorName: getHarvestedAreaData(state).indicatorName,
    harvestedAreaSources: getHarvestedAreaData(state).sources,
    harvestedAreaDownloadURI: getHarvestedAreaData(state).downloadURI,
    populationChartData: getLivestockPopData(state).chartData,
    populationIndicatorName: getLivestockPopData(state).indicatorName,
    populationSources: getLivestockPopData(state).sources,
    populationDownloadURI: getLivestockPopData(state).downloadURI
  });
};

export default connect(mapStateToProps, null)(Component);
