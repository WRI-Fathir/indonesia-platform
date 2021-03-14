import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { format } from 'd3-format';
import startCase from 'lodash/startCase';
import toLower from 'lodash/toLower';

import styles from './map-tooltip-styles.scss';

class MapTooltip extends PureComponent {
  render() {
    const { properties } = this.props;
    const {
      name,
      tooltipUnit,
      tooltipValue,
      sector,
      selectedYear
    } = properties || {};

    const value = Number.parseInt(tooltipValue, 10)
      ? format(',')(tooltipValue)
      : tooltipValue;

    return (
      <div className={styles.tooltipContainer}>
        <div className={styles.tooltipTitle}>
          {selectedYear} {name}
        </div>
        {
          // eslint-disable-next-line no-nested-ternary
          sector && tooltipValue ? (
            <div className={styles.tooltipContent}>
              <p className={styles.tooltipActivityName}>
                {startCase(toLower(sector))}
              </p>
              <p>
                <span>{value}</span>
                {' '}
                <span dangerouslySetInnerHTML={{ __html: tooltipUnit }} />
              </p>
            </div>
) : tooltipValue
              ? <p>{value}</p>
              : <p className={styles.noData}>No data</p>
        }
      </div>
    );
  }
}

MapTooltip.propTypes = { properties: PropTypes.object };

MapTooltip.defaultProps = { properties: null };

export default MapTooltip;
