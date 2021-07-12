/*
  filename: bar-chart-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Chart from 'components/chart';
import { format } from 'd3-format';
import get from 'lodash/get';
import CustomTooltip from './bar-chart-tooltip';
import styles from './bar-chart-styles';

class BarChart extends PureComponent {
  render() {
    const { chartData, barSize, t, noFormat } = this.props;

    const unit = get(chartData, 'config.axes.yLeft.unit');
    const formatted = unit === 'k'
      ? value => `${format('~s')(value)}`
      : value => `${format('~s')(value)} ${unit}`;
    const customYLabelFormat = noFormat
      ? value => `${value} ${unit}`
      : formatted;

    return (
      <React.Fragment>
        {
          chartData &&
            (
              <Chart
                type="bar"
                config={chartData.config}
                data={chartData.data}
                theme={{ legend: styles.legend }}
                customTooltip={<CustomTooltip />}
                getCustomYLabelFormat={customYLabelFormat}
                domain={chartData.domain}
                dataOptions={chartData.dataOptions}
                dataSelected={chartData.dataSelected}
                hideRemoveOptions
                height={300}
                barSize={barSize}
                barGap={0}
                customMessage={t('common.chart-no-data')}
              />
            )
        }
      </React.Fragment>
    );
  }
}

BarChart.propTypes = {
  chartData: PropTypes.object,
  barSize: PropTypes.number,
  noFormat: PropTypes.bool,
  t: PropTypes.string.isRequired
};

BarChart.defaultProps = { chartData: {}, barSize: 20, noFormat: false };

export default BarChart;
