import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import kebabCase from 'lodash/kebabCase';
import startCase from 'lodash/startCase';
import castArray from 'lodash/castArray';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import isEmpty from 'lodash/isEmpty';
import SectionTitle from 'components/section-title';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import ProvinceMetaProvider from 'providers/province-meta-provider';
import IndicatorsProvider from 'providers/indicators-provider';
import Chart from 'components/chart';
import { Switch, Dropdown, Button, Icon, Multiselect } from 'cw-components';
import cx from 'classnames';
import shareIcon from 'assets/icons/share';
import lineIcon from 'assets/icons/line_chart.svg';
import barIcon from 'assets/icons/barChart.svg';
import ModalShare from 'components/modal-share';

import dropdownStyles from 'styles/dropdown';
import button from 'styles/themes/button';
import CustomTooltip from './bar-chart-tooltip';
import styles from './social-styles';

class RegionPopulation extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  handleSwitchChange = option => {
    const { provinceISO, updateFiltersSelected } = this.props;

    updateFiltersSelected({
      section: 'social',
      region: provinceISO,
      query: { model: option.value }
    });
  };

  handleFilterChange = (field, selected) => {
    const { onFilterChange, selectedOptions } = this.props;

    const prevSelectedOptionValues = castArray(selectedOptions[field])
      .filter(o => o)
      .map(o => o.value);
    const selectedArray = castArray(selected);
    const newSelectedOption = selectedArray.find(
      o => !prevSelectedOptionValues.includes(o.value)
    );

    const removedAnyPreviousOverride = selectedArray
      .filter(v => v)
      .filter(v => !v.override);

    const values = newSelectedOption && newSelectedOption.override
      ? newSelectedOption.value
      : uniq(
        flatMap(removedAnyPreviousOverride, v => String(v.value).split(','))
      ).join(',');

    onFilterChange({ [field]: values });
  };

  renderSwitch() {
    const { selectedModel, filterOptions } = this.props;

    return (
      <div className={styles.switch}>
        <div className="switch-container">
          <Switch
            options={filterOptions.model}
            onClick={value => this.handleSwitchChange(value)}
            selectedOption={String(selectedModel.value)}
            theme={{
              wrapper: styles.switchWrapper,
              option: styles.option,
              checkedOption: styles.checkedOption
            }}
          />
        </div>
      </div>
    );
  }

  renderDropdown(field, multi, icons) {
    const { selectedOptions, filterOptions, t } = this.props;

    const value = selectedOptions && selectedOptions[field] || [];
    const options = filterOptions[field] || [];
    const iconsProp = icons ? { icons } : {};

    const label = t(`pages.regions.economy.labels.${kebabCase(field)}`);

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
        />
      );
    }

    return (
      <Dropdown
        key={field}
        label={label}
        placeholder={`Filter by ${startCase(field)}`}
        options={options}
        onValueChange={selected => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
        {...iconsProp}
      />
    );
  }

  renderChart() {
    const {
      chart,
      chartData,
      selectedOptions,
      dataOptions,
      dataSelected,
      t
    } = this.props;
    console.log('chartData', chartData);
    return (
      <Chart
        type={
          selectedOptions &&
            selectedOptions.chartType &&
            selectedOptions.chartType.value
        }
        config={chart.config}
        data={chartData}
        theme={{ legend: styles.legend }}
        domain={chart.domain}
        height={400}
        dataOptions={dataOptions}
        dataSelected={dataSelected}
        barSize={20}
        customMessage={t('common.chart-no-data')}
        showUnit
        onLegendChange={v => this.handleFilterChange('district', v)}
        getCustomYLabelFormat={chart.config.yLabelFormat}
        customTooltip={<CustomTooltip />}
      />
    );
  }

  render() {
    const {
      t,
      indicatorParams,
      metaParams,
      selectedModel,
      chartData
    } = this.props;

    const { isOpen } = this.state;
    const sources = [ 'PBdA2019n', 'PBdA2019o', 'PBdA2019p' ];
    const section = 'province_social';
    const downloadURI = `indicators.zip?section=${section}`;
    const shareableLink = `${window.location.href}`;
    const icons = { line: lineIcon, bar: barIcon };

    return (
      <div className={styles.page}>
        <div className={styles.chartMapContainer}>
          <div>
            <SectionTitle
              title={selectedModel.name}
              description={t('pages.regions.social.description')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <InfoDownloadToolbox
              className={{ buttonWrapper: styles.buttonWrapper }}
              slugs={sources}
              downloadUri={downloadURI}
              /* shareableLink={shareableLink} */
            />
            <Button
              theme={{ button: cx(styles.shareButton) }}
              onClick={() => this.setState({ isOpen: !isOpen })}
            >
              <Icon icon={shareIcon} />
              <span className={styles.shareText}>Share</span>
            </Button>
          </div>
        </div>
        <div>
          <div className={styles.dropdowns}>{this.renderSwitch()}</div>
          <div className={styles.container}>
            <div className={styles.toolbox}>
              <div className={styles.dropdownContainer}>
                <div className={styles.dropdown}>
                  {this.renderDropdown('indicator')}
                </div>
                <div className={styles.dropdown}>
                  {this.renderDropdown('district', true)}
                </div>
                <div className={styles.dropdown}>
                  {this.renderDropdown('chartType', false, icons)}
                </div>
              </div>
              <Button theme={{ button: cx(button.darkBlue, styles.button) }}>
                <NavLink
                  exact={'/en/national-context' || false}
                  key="/en/national-context"
                  to="/en/national-context"
                  activeClassName={styles.active}
                  onTouchStart={undefined}
                  onMouseDown={undefined}
                >
                  Jelajahi di Tingkat Nasional
                </NavLink>
              </Button>
            </div>
            {!isEmpty(chartData) && this.renderChart()}
          </div>
        </div>
        <ModalShare
          isOpen={isOpen}
          closeModal={() => this.setState({ isOpen: false })}
          sharePath={shareableLink}
        />
        <IndicatorsProvider />
        <ProvinceMetaProvider metaParams={metaParams} />
      </div>
    );
  }
}

RegionPopulation.propTypes = {
  t: PropTypes.func.isRequired,
  provinceISO: PropTypes.string,
  updateFiltersSelected: PropTypes.func,
  onFilterChange: PropTypes.func,
  selectedOptions: PropTypes.object,
  filterOptions: PropTypes.object,
  selectedModel: PropTypes.string,
  chart: PropTypes.object,
  chartData: PropTypes.array,
  indicatorParams: PropTypes.object,
  metaParams: PropTypes.object,
  dataOptions: PropTypes.array,
  dataSelected: PropTypes.array
};

RegionPopulation.defaultProps = {
  provinceISO: '',
  updateFiltersSelected: undefined,
  onFilterChange: undefined,
  selectedOptions: {},
  filterOptions: {},
  selectedModel: 'education',
  chart: {},
  chartData: [],
  indicatorParams: null,
  metaParams: null,
  dataOptions: [],
  dataSelected: []
};

export default RegionPopulation;
