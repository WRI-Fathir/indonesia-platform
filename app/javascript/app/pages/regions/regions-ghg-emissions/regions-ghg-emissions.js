/*
  filename: regions-ghg-emissions.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Component from './regions-ghg-emissions-component';
import { getGHGEmissions } from './regions-ghg-emissions-selectors';

import * as actions from './regions-ghg-emissions-actions';

const mapStateToProps = getGHGEmissions;

class RegionsGHGEmissionsContainer extends PureComponent {
  constructor() {
    super();
    this.state = { year: null };
  }

  onYearChange = year => {
    // weird workaround chart onmousemove invokes twice this function
    // first time with normal chart onmousemove object param from recharts
    if (typeof year === 'number') {
      this.setState({ year });
    }
  };

  onFilterChange = filter => {
    const { updateFiltersSelected, query, provinceISO } = this.props;

    updateFiltersSelected({
      section: 'regions-ghg-emissions',
      region: provinceISO,
      query: { ...query, ...filter }
    });
  };

  render() {
    const { year } = this.state;

    return (
      <Component
        {...this.props}
        selectedYear={year}
        onYearChange={this.onYearChange}
        onFilterChange={this.onFilterChange}
      />
    );
  }
}

RegionsGHGEmissionsContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
  provinceISO: PropTypes.string
};

RegionsGHGEmissionsContainer.defaultProps = { query: {}, provinceISO: '' };

export default connect(mapStateToProps, actions)(RegionsGHGEmissionsContainer);
