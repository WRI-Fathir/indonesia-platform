/*
  filename: climate-sectoral-plan.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import withTranslations from 'providers/translations-provider/with-translations.hoc';
import { getClimateSectoralPlanData } from './climate-sectoral-plan-selectors';
import Component from './climate-sectoral-plan-component';

import * as actions from './climate-sectoral-plan-actions';

const mapStateToProps = getClimateSectoralPlanData;

class ClimateSectoralPlanContainer extends PureComponent {
  onFilterChange = filter => {
    const { updateFiltersSelected, query, provinceIso } = this.props;

    updateFiltersSelected({
      section: 'climate-sectoral-plan',
      region: provinceIso,
      query: { ...query, ...filter }
    });
  };

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />;
  }
}

ClimateSectoralPlanContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
  provinceIso: PropTypes.string
};

ClimateSectoralPlanContainer.defaultProps = { query: {}, provinceIso: '' };

export default connect(mapStateToProps, actions)(
  withTranslations(ClimateSectoralPlanContainer)
);
