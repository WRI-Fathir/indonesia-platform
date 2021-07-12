/*
  filename: climate-funding.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ClimateFundingComponent from './climate-funding-component';
import { mapStateToProps } from './climate-funding-selectors';
import * as actions from './climate-funding-actions';

class ClimateFundingContainer extends Component {
  onSearchChange = value => {
    const { updateFiltersSelected, query } = this.props;

    updateFiltersSelected({
      section: 'climate-funding',
      query: { ...query, search: value }
    });
  };

  render() {
    return (
      <ClimateFundingComponent
        {...this.props}
        onSearchChange={this.onSearchChange}
      />
    );
  }
}

ClimateFundingContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

ClimateFundingContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(ClimateFundingContainer);
