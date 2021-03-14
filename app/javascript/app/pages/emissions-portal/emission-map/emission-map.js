import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Component from './emission-map-component';
import * as actions from './emission-map-actions';
import { getEmissionMap } from './selectors/emission-map-selectors';

const mapStateToProps = getEmissionMap;

class EmissionMapContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query } = this.props;

    updateFiltersSelected({
      section: 'emission-map',
      query: { ...query, ...filter }
    });
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

EmissionMapContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

EmissionMapContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(EmissionMapContainer);
// export default EmissionMapContainer;
