import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isArray from 'lodash/isArray';
import { getPolicy } from './policy-selectors';
import * as actions from './policy-actions';

import Component from './policy-component';

const mapStateToProps = getPolicy;

class PolicyContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query, provinceISO } = this.props;

    updateFiltersSelected({
      section: 'policy',
      region: provinceISO,
      query: { ...query, ...filter }
    });
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

PolicyContainer.propTypes = {
  query: PropTypes.object,
  provinceISO: PropTypes.string
};

PolicyContainer.defaultProps = { query: {}, provinceISO: '' };

export default connect(mapStateToProps, actions)(PolicyContainer);
