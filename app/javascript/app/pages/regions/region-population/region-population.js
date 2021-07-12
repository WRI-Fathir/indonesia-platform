/*
  filename: region-population.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isArray from 'lodash/isArray'
import { updateQueryParams } from 'utils'
import { getRegionPopulation } from './region-population-selectors'
import * as actions from './region-population-actions'

import Component from './region-population-component'

const mapStateToProps = getRegionPopulation

class RegionPopulationContainer extends PureComponent {
  onFilterChange = (filter) => {
    const { updateFiltersSelected, query } = this.props
    const provinceISO = 'ID.PB'

    updateFiltersSelected({
      section: 'region-population',
      region: provinceISO,
      query: updateQueryParams(query, filter),
    })
  }

  render() {
    return <Component {...this.props} onFilterChange={this.onFilterChange} />
  }
}

RegionPopulationContainer.propTypes = {
  updateFiltersSelected: PropTypes.func.isRequired,
  query: PropTypes.object,
  provinceISO: PropTypes.string,
  onFilterChange: PropTypes.func,
}

RegionPopulationContainer.defaultProps = {
  query: {},
  provinceISO: '',
  onFilterChange: undefined,
}

export default connect(mapStateToProps, actions)(RegionPopulationContainer)
