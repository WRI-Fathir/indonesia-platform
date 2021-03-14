import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Component from './economy-component';
import { getEconomies } from './economy-selectors';

import * as actions from './economy-actions';

const mapStateToProps = getEconomies;

class EconomyContainer extends PureComponent {

  onFilterChange = (filter) => {
    const { updateFiltersSelected, query, provinceISO } = this.props;

    let oldQuery = query

    if (filter && filter.indicator) oldQuery = null

    updateFiltersSelected({
      section: 'economy',
      region: provinceISO,
      query: { ...oldQuery, ...filter }
    });
  };

  render() {

    return (
      <Component
        {...this.props}
        onFilterChange={this.onFilterChange}
      />
    );
  }
}

EconomyContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
  provinceISO: PropTypes.string
};

EconomyContainer.defaultProps = { query: {}, provinceISO: '' };

export default connect(mapStateToProps, actions)(EconomyContainer);
