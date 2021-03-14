import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import castArray from 'lodash/castArray'
import toArray from 'lodash/toArray'
import kebabCase from 'lodash/kebabCase'
import filter from 'lodash/filter'
import groupBy from 'lodash/groupBy'
import uniq from 'lodash/uniq'
import startCase from 'lodash/startCase';
import flatMap from 'lodash/flatMap'

import { Chart, Dropdown, Multiselect, Button, Icon } from 'cw-components'
import ModalShare from 'components/modal-share';
import cx from 'classnames'

import { TabletLandscape } from 'components/responsive'
import InfoDownloadToolbox from 'components/info-download-toolbox'
import SectionTitle from 'components/section-title'
import MetadataProvider from 'providers/metadata-provider'
import EmissionProjectionProvider from 'providers/emission-projection-provider'
import dropdownStyles from 'styles/dropdown.scss'
import shareIcon from 'assets/icons/share';
import styles from './emission-projection-styles.scss'

class EmissionProjection extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      isOpen: false
    };
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
    let options = filterOptions[field] || []
    let value = selectedOptions && selectedOptions[field]
    let label = t(
      `pages.emissions-portal.emission-projection.labels.${kebabCase(field)}`
    )

    let disabled = field === 'developed'

    if (multi) {
      const values = castArray(value).filter(v => v);

      return (
        <Multiselect
          key={field}
          label={label}
          options={options}
          onValueChange={selected => this.handleFilterChange(field, selected)}
          values={values}
          theme={{ wrapper: dropdownStyles.select }}
          hideResetButton
          disabled={disabled}
        />
      );
    }

    return (
      <Dropdown
        key={field}
        label={label}
        options={options}
        onValueChange={(selected) => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        disabled={disabled}
        hideResetButton
      />
    )
  }

  renderChart() {
    const { chartData, chart, chartLoading, dataOptions, dataSelected } = this.props
    if (!chartData || !chart.config) return null

    return (
      <Chart
        theme={{legend: styles.legend}}
        type='line'
        config={chart.config}
        data={chartData}
        height={500}
        loading={chartLoading}
        dataOptions={dataOptions}
        showUnit
        dataSelected={dataSelected}
        onLegendChange={v => this.handleFilterChange('model', v)}
      />
    )
  }

  render() {
    const shareableLink = `${window.location.origin}${window.location.pathname}`
    const downloadURI = `${window.location.origin}/api/v1/emission_projections.zip`
    const { isOpen } = this.state
    const { t, query, chart } = this.props
    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.emissions-portal.emission-projection.title')}
          description={t('pages.emissions-portal.emission-projection.description')}
        />
        <div>
          <div className={styles.chartMapContainer}>
            <div className={styles.filtersChartContainer}>
              <div className={styles.dropdowns}>
                {this.renderDropdown('sector', false)}
                {this.renderDropdown('developed', false)}
                {this.renderDropdown('model', true)}
                {this.renderDropdown('scenario', false)}
                <InfoDownloadToolbox
                  className={{ buttonWrapper: styles.buttonWrapper }}
                  slugs={[ 'NDC' ]}
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
              <div className={styles.chartContainer}>
                {this.renderChart()}
              </div>
            </div>
          </div>
        </div>
        <MetadataProvider meta='ghgindo' />
        {<EmissionProjectionProvider />}
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({ isOpen: false })} sharePath={shareableLink} />
      </div>
    )
  }
}

EmissionProjection.propTypes = {
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

EmissionProjection.defaultProps = {
  chartData: undefined,
  emissionParams: undefined,
  emissionTargets: [],
  selectedOptions: undefined,
  filterOptions: undefined,
  selectedYear: null,
  query: null,
}

export default EmissionProjection
