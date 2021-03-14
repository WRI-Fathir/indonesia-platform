import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isArray from 'lodash/isArray';
import { getRegionSocial } from './social-selectors';
import { updateQueryParams } from 'utils'
import * as actions from './social-actions';

import Component from './social-component';

const mapStateToProps = getRegionSocial;

class SocialContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query } = this.props;
    const provinceISO = 'ID.PB'
    console.log('query', query)

    updateFiltersSelected({
      section: 'social',
      region: provinceISO,
      query: updateQueryParams(query, filter),
    })
  };
  /* updateIndicatorFilter = newFilter => {
    this.onFilterChange({
      popNationalIndicator: newFilter.value,
      popProvince: undefined
    });
  }; */
  /* updateLegendFilter = newFilter => {
    let values;
    if (isArray(newFilter)) {
      values = newFilter.map(v => v.value).join(',');
    } else {
      values = newFilter.value;
    }
    this.onFilterChange({ popProvince: values });
  }; */
  render() {
    return (
      <Component
        {...this.props}
        onFilterChange={this.onFilterChange}
        /* onIndicatorChange={this.updateIndicatorFilter} */
        /* onLegendChange={this.updateLegendFilter} */
      />
    );
  }
}

SocialContainer.propTypes = {
  // updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
  provinceISO: PropTypes.string
};

SocialContainer.defaultProps = { query: {}, provinceISO: '' };

export default connect(mapStateToProps, actions)(SocialContainer);
