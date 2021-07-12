/*
  filename: bar-chart-tooltip-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';
import get from 'lodash/get';
import styles from './bar-chart-tooltip-styles.scss';

const renderValue = ({ formatFunction }, value) => {
  if (!value) return 'n/a';
  if (formatFunction) return formatFunction(value);
  return value.toLocaleString('ID');
};

class CustomTooltip extends PureComponent {
  render() {
    const { content, config } = this.props;
    const hasContent = content && content.payload && content.payload.length > 0;
    const payload = get(content, 'payload[0].payload');
    const tooltipConfig = config && config.tooltip;
    const yKeys = payload && Object
        .keys(payload)
        .filter(k => k !== 'x')
        .sort((a, b) => payload[b] - payload[a]);
    
    return (
      <div className={styles.tooltip}>
        {
          hasContent ? (
            <div>
              <div className={styles.tooltipHeader}>
                <span>
                  {tooltipConfig.indicator}
                </span>
                <span>
                  {payload.x}
                </span>
              </div>
              <div className={styles.content}>
                {
                  yKeys && yKeys.map(k => (
                    <div className={styles.yDataContainer}>
                      <span className={styles.yLabel}>
                        {tooltipConfig[k].label}
                      </span>
                      <span className={styles.value}>
                        {renderValue(tooltipConfig, payload[k])}
                      </span>
                    </div>
                    ))
                }
              </div>
            </div>
) : <div>No data</div>
        }
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
