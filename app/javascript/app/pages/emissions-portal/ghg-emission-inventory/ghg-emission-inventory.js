import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updateQueryParams } from 'utils';
import Component from './ghg-emission-inventory-component';
import * as actions from './ghg-emission-inventory-actions';
import {
  getGHGEmissions
} from './ghg-emission-inventory-selectors/ghg-emission-inventory-selectors';

class HistoricalContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query } = this.props;
    
    let oldQuery = query

    let breabBys = ['region-absolute', 'sector-absolute', 'category-absolute', 'sub-category-absolute', 'gas-absolute']

    if (breabBys.includes(filter.breakBy)) oldQuery = null

    if (filter.source) {
      Object.assign(filter, { gas: null, region: null, sector: null });
    }

    if (filter.sector) {
      Object.assign(filter, { category: null, subCategory: null });
    }

    if (filter.category) {
      Object.assign(filter, { subCategory: null });
    }

    updateFiltersSelected({ query: updateQueryParams(oldQuery, filter) });
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

HistoricalContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

HistoricalContainer.defaultProps = { query: {} };

export default connect(getGHGEmissions, actions)(HistoricalContainer);
