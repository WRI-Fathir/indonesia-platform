/*
  filename: emission-target-chart-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash/camelCase';

import { EMISSION_TARGET } from 'constants';
import { PieChart } from 'cw-components';

import styles from './emission-target-chart-styles.scss';

const CHART_THEME = [ '#FF6C2F', '#03209F', '#0845CB' ];
const EMISSION_TARGET_UNIT = 'tCO2e';

const getScale = unit => {
  if (unit.startsWith('kt')) return 1000;
  if (unit.startsWith('Mt')) return 1000000;
  return 1;
};
const convertUnit = (value, unit) => value * getScale(unit);

class EmissionTargetChart extends PureComponent {
  render() {
    const { emissionTargets, t } = this.props;

    if (!emissionTargets || !emissionTargets.length) return null;

    // not sure why needs to be camel cased, probably that's a bug in pie chart component
    // TODO: fix that in cw-components
    const targets = emissionTargets.map(et => ({
      ...et,
      sector: camelCase(et.sector)
    }));

    const emissionTarget = emissionTargets[0];
    const { year, label } = emissionTarget;

    const data = targets.map(et => ({
      name: et.sector,
      value: convertUnit(et.value, et.unit)
    }));
    const theme = targets.reduce(
      (acc, et, index) => ({
        ...acc,
        [et.sector]: {
          label: et.sector_name,
          stroke: CHART_THEME[index],
          fill: CHART_THEME[index]
        }
      }),
      {}
    );
    const tooltip = targets.reduce(
      (acc, et) => ({ ...acc, [et.sector]: { label: et.sector_name } }),
      {}
    );

    const config = {
      tooltip,
      animation: false,
      axes: { yLeft: { unit: EMISSION_TARGET_UNIT, label: year } },
      theme
    };

    const getTitleByLabel = emissionLabel =>
      ({
        [EMISSION_TARGET.bau]: t(
          'pages.regions.regions-ghg-emissions.projected-bau-by'
        ),
        [EMISSION_TARGET.target]: t(
          'pages.regions.regions-ghg-emissions.emission-target-by'
        )
      })[emissionLabel] ||
        emissionLabel;

    return (
      <div>
        <h2 className={styles.targetChartTitle}>
          {getTitleByLabel(label)} {year}
        </h2>
        <PieChart
          data={data}
          width="100%"
          config={config}
          theme={{ pieChart: styles.targetChart }}
        />
      </div>
    );
  }
}

EmissionTargetChart.propTypes = {
  t: PropTypes.func.isRequired,
  emissionTargets: PropTypes.array.isRequired
};

export default EmissionTargetChart;
