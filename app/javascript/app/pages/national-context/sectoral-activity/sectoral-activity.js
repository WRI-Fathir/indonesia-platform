/*
  filename: sectoral-activity.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Component from './sectoral-activity-component';
import * as actions from './sectoral-activity-actions';
import { getSectoralActivity } from './selectors/sectoral-activity-selectors';

const mapStateToProps = getSectoralActivity;

class SectoralActivityContainer extends PureComponent {
  onFilterChange = (filter, clear = false) => {
    const { updateFiltersSelected, query } = this.props;

    if (clear) {
      updateFiltersSelected({
        section: 'sectoral-activity',
        query: { ...filter }
      });
    } else {
      updateFiltersSelected({
        section: 'sectoral-activity',
        query: { ...query, ...filter }
      });
    }
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

SectoralActivityContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object
};

SectoralActivityContainer.defaultProps = { query: {} };

export default connect(mapStateToProps, actions)(SectoralActivityContainer);
