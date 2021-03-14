import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import SectionTitle from 'components/section-title'
import InfoDownloadToolbox from 'components/info-download-toolbox'
import Chart from 'components/chart'
import cx from 'classnames';
import { Switch, Card, Dropdown, Button, Icon } from 'cw-components'
import dropdownStyles from 'styles/dropdown'
import ProvinceMetaProvider from 'providers/province-meta-provider'
import IndicatorsProvider from 'providers/indicators-provider';
import startCase from 'lodash/startCase'
import kebabCase from 'lodash/kebabCase'
import castArray from 'lodash/castArray'
import uniq from 'lodash/uniq'
import flatMap from 'lodash/flatMap'
import shareIcon from 'assets/icons/share';
import ModalShare from 'components/modal-share';
import PopulationMap from './population-map'
import CustomTooltip from './bar-chart-tooltip';

import styles from './region-population-styles'

const cardTheme = {
  card: styles.card,
  contentContainer: styles.contentContainer,
  data: styles.data,
  title: styles.title,
}

class RegionPopulation extends PureComponent {

  constructor(props) {
    super(props);
  
    this.state = {
      isOpen: false
    };
  }

  handleFilterChange = (field, selected) => {

    const { onFilterChange, selectedOptions } = this.props

    const prevSelectedOptionValues = castArray(selectedOptions[field])
      .filter((o) => o)
      .map((o) => o.value)
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

  handleSwitchChange = (option) => {
    const { provinceISO, updateFiltersSelected } = this.props

    updateFiltersSelected({
      section: 'region-population',
      region: provinceISO,
      query: ({ model: option.value })
    })
  }

  renderSwitch() {
    const { selectedModel, filterOptions } = this.props
    return (
      <div className={styles.switch}>
        <div className='switch-container'>
          <Switch
            options={filterOptions.model}
            onClick={value => this.handleSwitchChange(value)}
            selectedOption={selectedModel.value}
            theme={{
              wrapper: styles.switchWrapper,
              option: styles.option,
              checkedOption: styles.checkedOption,
            }}
          />
        </div>
      </div>
    )
  }

  renderDropdown(field) {
    const { selectedOptions, filterOptions, t } = this.props

    const value = selectedOptions && selectedOptions[field]
    const options = filterOptions[field] || []

    const label = t(`pages.regions.region-population.labels.${kebabCase(field)}`)

    return (
      <Dropdown
        key={field}
        label={label}
        placeholder={`Filter by ${startCase(field)}`}
        options={options}
        onValueChange={(selected) => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
      />
    )
  }

  renderContent() {
    const {
      t,
      selectedModel,
      chart,
      chartData,
      popTotal,
      popDensity,
      popGrowth,
      popSexRatio,
    } = this.props

    if (selectedModel.value === 'population') {
      return (
        <div className={styles.chartMapContainer}>
          <div className={styles.filtersChartContainer}>
            <div className={styles.dropdownContainer}>
              <div className={styles.dropdown}>
                {this.renderDropdown('year')}
              </div>
              <div className={styles.dropdown}>
                {this.renderDropdown('district')}
              </div>
            </div>
            <div className={styles.chartContainer}>
              <PopulationMap />
            </div>
          </div>
          <div className={styles.cardContainer}>
            <Card theme={cardTheme} title={t('pages.regions.region-population.cards.card-1')}>
              <div className={styles.cardContent}>
                <p>{popTotal !== null && popTotal.toLocaleString('id')}</p>
              </div>
            </Card>
            <Card theme={cardTheme} title={t('pages.regions.region-population.cards.card-2')}>
              <div className={styles.cardContent}>
                <p>{popGrowth !== null && popGrowth.toLocaleString('id')}</p>
              </div>
            </Card>
            <Card theme={cardTheme} title={t('pages.regions.region-population.cards.card-3') + '\xB2'}>
              <div className={styles.cardContent}>
                <p>
                  {popDensity !== null && popDensity.toLocaleString('id')}
                </p>
              </div>
            </Card>
            <Card
              theme={cardTheme}
              title={t('pages.regions.region-population.cards.card-4')}
            >
              <div className={styles.cardContent}>
                <p>{popSexRatio !== null && popSexRatio.toLocaleString('id')}</p>
              </div>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.container}>
        <div className={styles.toolbox}>
          <div className={styles.dropdown}>
            {this.renderDropdown('year')}
          </div>
        </div>
        <Chart
          type='bar'
          config={chart.config}
          data={chartData}
          theme={{ legend: styles.legend }}
          getCustomYLabelFormat={chart.config.yLabelFormat}
          domain={chart.domain}
          dataOptions={chart.dataOptions}
          dataSelected={chart.dataSelected}
          height={400}
          barSize={30}
          customMessage={t('common.chart-no-data')}
          showUnit
          customTooltip={<CustomTooltip />}
        />
      </div>
    )
  }

  render() {
    const { t, params, metaParams, selectedModel } = this.props
    const { isOpen } = this.state
    const sources = ['PBdA2019a', 'PBdA2019b','PBdA2019c','PBdA2019d']

    const section = 'province_population'
    const downloadURI = `indicators.zip?section=${section}`
    const shareableLink = `${window.location.href}`
    return (
      <div className={styles.page}>
        <div className={styles.chartMapContainer}>
          <div>
            <SectionTitle
              title={selectedModel.label}
              description={t('pages.regions.region-population.description')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>
              <InfoDownloadToolbox
                className={{ buttonWrapper: styles.buttonWrapper }}
                slugs={sources}
                downloadUri={downloadURI}
                // shareableLink={shareableLink}
              />
              <Button
                theme={{ button: cx(styles.shareButton) }}
                onClick={() => this.setState({isOpen: !isOpen})}
              >
                <Icon icon={shareIcon} />
                <span className={styles.shareText}>Share</span>
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div className={styles.dropdowns}>{this.renderSwitch()}</div>
          {this.renderContent()}
        </div>
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({isOpen: false})} sharePath={shareableLink} />
        <IndicatorsProvider />
        <ProvinceMetaProvider metaParams={metaParams} />
      </div>
    )
  }
}

RegionPopulation.propTypes = {
  t: PropTypes.func.isRequired,
  chart: PropTypes.object,
  chartData: PropTypes.array,
  selectedOptions: PropTypes.object,
  selectedModel: PropTypes.object,
  filterOptions: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  popTotal: PropTypes.number,
  popGrowth: PropTypes.number,
  popDensity: PropTypes.number,
  popSexRatio: PropTypes.number,
  params: PropTypes.object,
  metaParams: PropTypes.object,
  provinceISO: PropTypes.string,
  updateFiltersSelected: PropTypes.func,
}

RegionPopulation.defaultProps = {
  chart: {},
  chartData: [],
  selectedOptions: {},
  filterOptions: {},
  popTotal: "",
  popGrowth: "",
  popDensity: "",
  popSexRatio: "",
  params: {},
  metaParams: {},
  provinceISO: "",
  updateFiltersSelected: undefined,
  selectedModel: '',
}

export default RegionPopulation
