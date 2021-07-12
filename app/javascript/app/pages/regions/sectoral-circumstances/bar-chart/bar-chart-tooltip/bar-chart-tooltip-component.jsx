/*
  filename: bar-chart-tooltip-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';
import { format } from 'd3-format';
import styles from './bar-chart-tooltip-styles.scss';

class CustomTooltip extends PureComponent {
  renderValue = y => {
    if (y.payload && y.payload[y.dataKey] !== undefined) {
      return format(',.2f')(y.payload[y.dataKey]);
    }
    return 'n/a';
  };

  render() {
    const { config, content } = this.props;
    const yUnit = config &&
      config.axes &&
      config.axes.yLeft &&
      config.axes.yLeft.unitTooltip;
    const theme = config && config.theme;

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipHeader}>
          <span className={styles.label}>
            {content.label}
          </span>
          {
            yUnit && (
            <span
              className={styles.label}
                  /* eslint-disable-line*/
              dangerouslySetInnerHTML={{ __html: yUnit }}
            />
              )
          }
        </div>
        {
          content &&
            content.payload &&
            content.payload.length > 0 &&
            content.payload.map(
              y =>
                y.payload &&
                  y.dataKey !== 'total' &&
                  config.tooltip[y.dataKey] &&
                  config.tooltip[y.dataKey].label
                  ? (
                    <div key={`${y.dataKey}`} className={styles.tooltipHeader}>
                      {
                      yUnit && (
                      <div>
                        <span
                          className={styles.circle}
                          style={{
                                backgroundColor: theme[y.dataKey].stroke
                              }}
                        />
                        <span
                              /* eslint-disable-line*/
                          dangerouslySetInnerHTML={{
                                __html: config.tooltip[y.dataKey].label
                              }}
                        />
                      </div>
                        )
                    }
                      <span>
                        {this.renderValue(y)}
                      </span>
                    </div>
)
                  : null
            )
        }
        {content && !content.payload && <div>No data available</div>}
      </div>
    );
  }
}

CustomTooltip.propTypes = {
  content: Proptypes.object,
  config: Proptypes.object
};
CustomTooltip.defaultProps = { content: {}, config: {} };

export default CustomTooltip;
