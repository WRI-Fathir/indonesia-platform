/*
  filename: energy.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEnergy } from './energy-selectors';
import * as actions from './energy-actions';

import Component from './energy-component';

const mapStateToProps = getEnergy;

class EnergyContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query } = this.props;

    let oldQuery = query;
    if (filter && filter.energyInd) {
      oldQuery = {};
    }

    updateFiltersSelected({ query: { ...oldQuery, ...filter } });
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

EnergyContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

EnergyContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(EnergyContainer);
