import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Component from './emission-projection-component';
import { getEmissionProjection } from './emission-projection-selectors';

import * as actions from './emission-projection-actions';

const mapStateToProps = getEmissionProjection;

class EmissionProjectionContainer extends PureComponent {
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
    const { updateFiltersSelected, query } = this.props;

    let newQuery = query

    if (filter && filter.sector) {
      newQuery = null
    }

    updateFiltersSelected({
      section: 'emission-projection',
      query: { ...newQuery, ...filter }
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

EmissionProjectionContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
};

EmissionProjectionContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(EmissionProjectionContainer);
