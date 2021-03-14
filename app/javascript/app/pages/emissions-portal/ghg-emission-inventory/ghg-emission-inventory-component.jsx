import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import GHGMetadataProvider from 'providers/ghg-inventory-metadata-provider';
import MetadataProvider from 'providers/metadata-provider'
import GHGEmissionsProvider from 'providers/ghg-emissions-provider';
import GHGTargetEmissionsProvider from 'providers/ghg-target-emissions-provider';
import WorldBankProvider from 'providers/world-bank-provider';
import SectionTitle from 'components/section-title';
import { Switch, Chart, Dropdown, Multiselect, Button, Icon } from 'cw-components';
import { API, METRIC_OPTIONS } from 'constants';
import { format } from 'd3-format';
import startCase from 'lodash/startCase';
import kebabCase from 'lodash/kebabCase';
import castArray from 'lodash/castArray';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import ModalShare from 'components/modal-share';
import cx from 'classnames'
import shareIcon from 'assets/icons/share';

import dropdownStyles from 'styles/dropdown.scss';
import lineIcon from 'assets/icons/line_chart.svg';
import areaIcon from 'assets/icons/area_chart.svg';
import styles from './ghg-emission-inventory-styles.scss';

class Inventory extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      isOpen: false
    };
  }

  handleLegendChange = selected => {
    const { selectedModel } = this.props;
    const KABUPATEN = 'kabupaten';

    if (selectedModel === KABUPATEN) {
      this.handleFilterChange('district', selected);
    } else {
      this.handleFilterChange('sector', selected);
    }
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

  renderDropdown(field, icons) {
    const {
      apiSelected,
      selectedOptions,
      filterOptions,
      metricSelected,
      fieldToBreakBy,
      t
    } = this.props;
    const value = selectedOptions && selectedOptions[field];
    const options = filterOptions[field] || [];
    const iconsProp = icons ? { icons } : {};
    const isChartReady = filterOptions.source;
    if (!isChartReady) return null;

    const label = t(
      `pages.emissions-portal.ghg-emission-inventory.labels.${kebabCase(field)}`
    );

    let multi = fieldToBreakBy == field ? true : false

    const variant = icons ? "icons-labels" : undefined

    const disabled = field === 'category' || 
                     field === 'subCategory'

    if (multi) {
      const values = castArray(value).filter(v => v);

      return (
        <Multiselect
          key={field}
          label={label}
          placeholder={`Filter by ${startCase(field)}`}
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
        placeholder={`Filter by ${startCase(field)}`}
        options={options}
        onValueChange={selected => this.handleFilterChange(field, selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
        variant={variant}
        disabled={disabled}
        {...iconsProp}
      />
    );
  }

  render() {
    const {
      downloadURI,
      metadataSources,
      emissionParams,
      metaParams,
      selectedOptions,
      chartData,
      fieldToBreakBy,
      t
    } = this.props;

    const icons = { 'Line': lineIcon, 'Stacked Area': areaIcon };
    const shareableLink = `${window.location.origin}${window.location.pathname}`
    const { isOpen } = this.state

    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.emissions-portal.ghg-emission-inventory.title')}
          description={t(
            'pages.emissions-portal.ghg-emission-inventory.description'
          )}
        />
        <div className={styles.filtersGroup}>
          <div className={styles.filters}>
            {this.renderDropdown('breakBy')}
            {this.renderDropdown('region')}
            {this.renderDropdown('sector')}
            {this.renderDropdown('category')}
            {this.renderDropdown('subCategory')}
            {this.renderDropdown('gas')}
            {this.renderDropdown('chartType', icons)}
            <InfoDownloadToolbox
              className={{ buttonWrapper: styles.buttonWrapper }}
              slugs={[ 'SIGNSa', 'SIGNSb' ]}
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
        </div>
        <div className={styles.chartContainer}>
          {
            chartData &&
              chartData.data &&
              (
                <Chart
                  theme={{
                    legend: styles.legend,
                    projectedLegend: styles.projectedLegend
                  }}
                  type={
                    selectedOptions &&
                      selectedOptions.chartType &&
                      selectedOptions.chartType.value
                  }
                  config={chartData.config}
                  data={chartData.data}
                  domain={chartData.domain}
                  dataOptions={chartData.dataOptions}
                  dataSelected={chartData.dataSelected}
                  height={500}
                  loading={chartData.loading}
                  onLegendChange={v => this.handleFilterChange(fieldToBreakBy, v)}
                  getCustomYLabelFormat={value => format('.3s')(value)}
                  showUnit
                />
              )
          }
        </div>
        <GHGMetadataProvider params={metaParams} />
        <MetadataProvider meta='ghgindo' />
        <MetadataProvider meta='ghgcw' />
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({ isOpen: false })} sharePath={shareableLink} />
        <WorldBankProvider />
        {emissionParams && <GHGEmissionsProvider params={emissionParams} />}
        {emissionParams && <GHGTargetEmissionsProvider />}
      </div>
    );
  }
}

Inventory.propTypes = {
  t: PropTypes.func.isRequired,
  apiSelected: PropTypes.string,
  metadataSources: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  downloadURI: PropTypes.string,
  chartData: PropTypes.object,
  emissionParams: PropTypes.object,
  fieldToBreakBy: PropTypes.string,
  filterOptions: PropTypes.object,
  metricSelected: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  selectedOptions: PropTypes.object
};

Inventory.defaultProps = {
  apiSelected: undefined,
  chartData: undefined,
  metadataSources: undefined,
  downloadURI: undefined,
  emissionParams: undefined,
  fieldToBreakBy: undefined,
  filterOptions: undefined,
  metricSelected: undefined,
  selectedOptions: undefined
};

export default Inventory;
