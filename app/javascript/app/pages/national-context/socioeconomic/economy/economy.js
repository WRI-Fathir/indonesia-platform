/*
  filename: economy.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isArray from 'lodash/isArray';
import { getEconomy } from './economy-selectors';
import * as actions from './economy-actions';

import Component from './economy-component';

const mapStateToProps = getEconomy;

class EconomyContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query } = this.props;

    updateFiltersSelected({ query: { ...query, ...filter } });
  };

  updateIndicatorFilter = newFilter => {
    this.onFilterChange({
      gdpNationalIndicator: newFilter.value,
      gdpProvince: undefined
    });
  };

  updateLegendFilter = newFilter => {
    let values;
    if (isArray(newFilter)) {
      values = newFilter.map(v => v.value).join(',');
    } else {
      values = newFilter.value;
    }
    this.onFilterChange({ gdpProvince: values });
  };

  render() {
    return (
      <Component
        {...this.props}
        onFilterChange={this.onFilterChange}
        onIndicatorChange={this.updateIndicatorFilter}
        onLegendChange={this.updateLegendFilter}
      />
    );
  }
}

EconomyContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

EconomyContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(EconomyContainer);
