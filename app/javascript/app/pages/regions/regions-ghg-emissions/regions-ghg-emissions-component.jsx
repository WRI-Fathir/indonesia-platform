/*
  filename: regions-ghg-emissions-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import castArray from 'lodash/castArray'
import toArray from 'lodash/toArray'
import kebabCase from 'lodash/kebabCase'
import groupBy from 'lodash/groupBy'
import uniq from 'lodash/uniq'
import flatMap from 'lodash/flatMap'

import { Chart, Dropdown, Multiselect, Button, Icon } from 'cw-components'

import { TabletLandscape } from 'components/responsive'
import InfoDownloadToolbox from 'components/info-download-toolbox'
import SectionTitle from 'components/section-title'
import MetadataProvider from 'providers/metadata-provider'
import GHGEmissionsProvider from 'providers/ghg-emissions-provider'
import GHGTargetEmissionsProvider from 'providers/ghg-target-emissions-provider'
import dropdownStyles from 'styles/dropdown.scss'
import GHGMap from './ghg-map'
import EmissionTargetChart from './emission-target-chart'
import ModalShare from 'components/modal-share';
import shareIcon from 'assets/icons/share';
import cx from 'classnames';

import styles from './regions-ghg-emissions-styles.scss'

class RegionsGhgEmissions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  handleFilterChange = (field, selected) => {
    const { onFilterChange, selectedOptions } = this.props

    const prevSelectedOptionValues = castArray(selectedOptions[field]).map(
      (o) => o.value
    )
    const selectedArray = castArray(selected)
    const newSelectedOption = selectedArray.find(
      (o) => !prevSelectedOptionValues.includes(o.value)
    )

    const removedAnyPreviousOverride = selectedArray
      .filter((v) => v)
      .filter((v) => !v.override)

    const values =
      newSelectedOption && newSelectedOption.override
        ? newSelectedOption.value
        : uniq(
            flatMap(removedAnyPreviousOverride, (v) =>
              String(v.value).split(','))
          ).join(',')

    onFilterChange({ [field]: values })
  }

  renderDropdown(field, multi) {
    const { selectedOptions, filterOptions, t } = this.props
    const value = selectedOptions && selectedOptions[field]
    const options = filterOptions[field] || []

    const label = t(
      `pages.regions.regions-ghg-emissions.labels.${kebabCase(field)}`
    )
    if (multi) {
      const values = castArray(value).filter((v) => v)
      return (
        <Multiselect
          key={field}
          label={label}
          options={options}
          onValueChange={(selected) => this.handleFilterChange(field, selected)}
          values={values}
          theme={{ wrapper: dropdownStyles.select }}
          hideResetButton
        />
      )
    }
    return (
      <Dropdown
        key={field}
        label={label}
        options={options}
        onValueChange={(selected) => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
      />
    )
  }

  renderChart() {
    const { chartData, onYearChange } = this.props
    if (!chartData || !chartData.data || !chartData.config) return null
      
    return (
      <Chart
        theme={{
          legend: styles.legend,
          projectedLegend: styles.projectedLegend,
        }}
        type='line'
        config={chartData.config}
        data={chartData.data}
        domain={chartData.domain}
        dataOptions={chartData.dataOptions}
        dataSelected={chartData.dataSelected}
        height={500}
        loading={chartData.loading}
        showUnit
        onLegendChange={(v) => this.handleFilterChange('sector', v)}
        getCustomYLabelFormat={chartData.config.yLabelFormat}
        onMouseMove={onYearChange}
        margin={{ top: 45, right: 0, left: 0, bottom: 0 }}
      />
    )
  }

  renderPieCharts() {
    const { emissionTargets } = this.props

    if (!emissionTargets || !emissionTargets.length) return null

    const groupedTargets = toArray(
      groupBy(emissionTargets, (et) => `${et.year} - ${et.label}`)
    )

    return (
      <div className={styles.targetChartsContainer}>
        {groupedTargets.map((targets) => (
          <EmissionTargetChart emissionTargets={targets} />
        ))}
      </div>
    )
  }

  render() {
    const { emissionParams, selectedYear, provinceISO, t, query } = this.props
    const { isOpen } = this.state;
    const shareableLink = `${window.location.href}`;

    const sources = ['RADGRK', 'SIGNSa']
    const downloadURI = `emissions/download?source=${sources.join(
      ','
    )}&location=${provinceISO}`

    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.regions.regions-ghg-emissions.title')}
          description={t('pages.regions.regions-ghg-emissions.description')}
        />
        <div>
          <div className={styles.chartMapContainer}>
            <div className={styles.filtersChartContainer}>
              <div className={styles.dropdowns}>
                {this.renderDropdown('metric', false)}
                {this.renderDropdown('sector', true)}
                {this.renderDropdown('gas', false)}
                <InfoDownloadToolbox
                  className={{ buttonWrapper: styles.buttonWrapper }}
                  slugs={sources}
                  downloadUri={downloadURI}
                />
                <Button
                  theme={{ button: cx(styles.shareButton) }}
                  onClick={() => this.setState({ isOpen: !isOpen })}
                >
                  <Icon icon={shareIcon} />
                  <span className={styles.shareText}>Share</span>
                </Button>
              </div>
              <div className={styles.chartContainer}>{this.renderChart()}</div>
            </div>
            <TabletLandscape>
              <GHGMap selectedYear={selectedYear} query={query} />
            </TabletLandscape>
          </div>
        </div>
        <div>{this.renderPieCharts()}</div>
        <ModalShare
          isOpen={isOpen}
          closeModal={() => this.setState({ isOpen: false })}
          sharePath={shareableLink}
        />
        <MetadataProvider meta='ghgindo' />
        {emissionParams && <GHGEmissionsProvider params={emissionParams} />}
        {emissionParams && <GHGTargetEmissionsProvider />}
      </div>
    )
  }
}

RegionsGhgEmissions.propTypes = {
  t: PropTypes.func.isRequired,
  chartData: PropTypes.object,
  emissionParams: PropTypes.object,
  emissionTargets: PropTypes.array,
  selectedOptions: PropTypes.object,
  filterOptions: PropTypes.object,
  selectedYear: PropTypes.number,
  provinceISO: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  query: PropTypes.object,
}

RegionsGhgEmissions.defaultProps = {
  chartData: undefined,
  emissionParams: undefined,
  emissionTargets: [],
  selectedOptions: undefined,
  filterOptions: undefined,
  selectedYear: null,
  query: null,
}

export default RegionsGhgEmissions
