/*
  filename: historical-emissions-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MetadataProvider from 'providers/metadata-provider';
import GHGEmissionsProvider from 'providers/ghg-emissions-provider';
import GHGTargetEmissionsProvider from 'providers/ghg-target-emissions-provider';
import WorldBankProvider from 'providers/world-bank-provider';
import SectionTitle from 'components/section-title';
import { Switch, Chart, Dropdown, Multiselect } from 'cw-components';
import { API, METRIC_OPTIONS } from 'constants';
import { format } from 'd3-format';
import startCase from 'lodash/startCase';
import kebabCase from 'lodash/kebabCase';
import castArray from 'lodash/castArray';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import InfoDownloadToolbox from 'components/info-download-toolbox';

import dropdownStyles from 'styles/dropdown.scss';
import lineIcon from 'assets/icons/line_chart.svg';
import areaIcon from 'assets/icons/area_chart.svg';
import styles from './historical-emissions-styles.scss';

class Historical extends PureComponent {
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

  renderDropdown(field, multi, icons) {
    const {
      apiSelected,
      selectedOptions,
      filterOptions,
      metricSelected,
      t
    } = this.props;
    const value = selectedOptions && selectedOptions[field];
    const options = filterOptions[field] || [];
    const iconsProp = icons ? { icons } : {};
    const isChartReady = filterOptions.source;
    if (!isChartReady) return null;

    const label = t(
      `pages.national-context.historical-emissions.labels.${kebabCase(field)}`
    );

    let variant = icons ? "icons-labels" : undefined

    if (multi) {
      const absoluteMetric = metricSelected === METRIC_OPTIONS.ABSOLUTE_VALUE;
      const disabled = apiSelected === API.indo &&
        field === 'sector' &&
        !absoluteMetric;

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
        {...iconsProp}
      />
    );
  }

  renderSwitch() {
    const { filterOptions, selectedOptions } = this.props;
    return selectedOptions.source && (
    <div className={styles.switch}>
      <div className="switch-container">
        <Switch
          options={filterOptions.source}
          onClick={value => this.handleSwitchChange(value)}
          selectedOption={String(selectedOptions.source.value)}
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

  render() {
    const {
      downloadURI,
      metadataSources,
      emissionParams,
      selectedOptions,
      chartData,
      fieldToBreakBy,
      t
    } = this.props;
    const icons = { 'Line': lineIcon, 'Area': areaIcon };
    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.emissions-portal.ghg-emission-inventory-cait.title')}
          description={t(
            'pages.emissions-portal.ghg-emission-inventory-cait.description'
          )}
        />
        <div className={styles.filtersGroup}>
          <div className={styles.filters}>
            {this.renderDropdown('breakBy')}
            {this.renderDropdown('region', true)}
            {this.renderDropdown('sector', true)}
            {this.renderDropdown('gas', true)}
            {this.renderDropdown('chartType', false, icons)}
          </div>
          <InfoDownloadToolbox
            className={{ buttonWrapper: styles.buttonWrapper }}
            slugs={metadataSources}
            downloadUri={downloadURI}
          />
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
                  projectedData={chartData.projectedData || []}
                  domain={chartData.domain}
                  dataOptions={chartData.dataOptions}
                  dataSelected={chartData.dataSelected}
                  height={500}
                  loading={chartData.loading}
                  onLegendChange={v =>
                    this.handleFilterChange(fieldToBreakBy, v)}
                  getCustomYLabelFormat={value => format('.3s')(value)}
                  showUnit
                />
              )
          }
        </div>
        <MetadataProvider meta="ghgindo" />
        <MetadataProvider meta="ghgcw" />
        <WorldBankProvider />
        {emissionParams && <GHGEmissionsProvider params={emissionParams} />}
        {emissionParams && <GHGTargetEmissionsProvider />}
      </div>
    );
  }
}

Historical.propTypes = {
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

Historical.defaultProps = {
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

export default Historical;
