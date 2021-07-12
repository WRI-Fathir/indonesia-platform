/*
  filename: economy-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import castArray from 'lodash/castArray';
import kebabCase from 'lodash/kebabCase';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';

import {
  Chart,
  Dropdown,
  Multiselect,
  Table,
  Button,
  Icon
} from 'cw-components';

import InfoDownloadToolbox from 'components/info-download-toolbox';
import SectionTitle from 'components/section-title';
import ProvinceMetaProvider from 'providers/province-meta-provider';
import IndicatorProvider from 'providers/indicators-provider';
import dropdownStyles from 'styles/dropdown.scss';
import lineIcon from 'assets/icons/line_chart.svg';
import areaIcon from 'assets/icons/area_chart.svg';
import shareIcon from 'assets/icons/share';
import ModalShare from 'components/modal-share';
import CustomTooltip from './bar-chart-tooltip';

import styles from './economy-styles.scss';

class Economies extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
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

    const prevSelectedOptionValues = castArray(selectedOptions[field]).map(
      o => o.value
    );
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
    const { selectedModel } = this.props;

    const { selectedOptions, filterOptions, t } = this.props;
    const value = selectedOptions && selectedOptions[field];
    const options = filterOptions[field] || [];
    const iconsProp = icons ? { icons } : {};
    const disabled = field === 'sector' && selectedModel === 'kabupaten' ||
      field === 'district' && selectedModel === 'sektor';

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
          disabled={disabled}
          hideResetButton
        />
      );
    }
    return (
      <Dropdown
        key={field}
        label={label}
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
    const { chartData, selectedOptions, config } = this.props;
    if (!chartData || !chartData.data) return null;
    return (
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
        dataOptions={chartData.dataOptions}
        dataSelected={chartData.dataSelected}
        height={500}
        loading={chartData.loading}
        getCustomYLabelFormat={chartData.config.yLabelFormat}
        onLegendChange={v => this.handleLegendChange(v)}
        showUnit
      />
    );
  }

  renderTable() {
    const { tableData, tableConfig } = this.props;
    if (!tableData) return null;

    const setColumnWidth = column => {
      if (tableConfig.narrowColumns.includes(column)) return 100;
      return 230;
    };

    return (
      <Table
        data={tableData}
        hasColumnSelect
        parseMarkdown
        firstColumnHeaders={tableConfig.firstColumnHeaders}
        narrowColumns={tableConfig.narrowColumns}
        emptyValueLabel="Data belum tersedia"
        defaultColumns={tableConfig.defaultColumns}
        horizontalScroll
        dinamicRowsHeight
        shouldOverflow
        setColumnWidth={setColumnWidth}
      />
    );
  }

  render() {
    const { indicatorParams, metadataParams, t, sources } = this.props;
    const icons = { line: lineIcon, area: areaIcon };
    const shareableLink = `${window.location.href}`;

    const { isOpen } = this.state;

    const section = 'province_economic';
    const downloadURI = `indicators.zip?section=${section}`;

    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.regions.economy.title')}
          description={t('pages.regions.economy.description')}
        />
        <div>
          <div className={styles.chartMapContainer}>
            <div className={styles.filtersChartContainer}>
              <div className={styles.dropdowns}>
                {this.renderDropdown('indicator', false)}
                {this.renderDropdown('district', true)}
                {this.renderDropdown('sector', true)}
                {this.renderDropdown('chartType', false, icons)}
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
              <div className={styles.chartContainer}>
                {this.renderChart()}
              </div>
              <div className={styles.tableContainer}>
                {this.renderTable()}
              </div>
            </div>
          </div>
        </div>
        <ModalShare
          isOpen={isOpen}
          closeModal={() => this.setState({ isOpen: false })}
          sharePath={shareableLink}
        />
        {metadataParams && <ProvinceMetaProvider metaParams={metadataParams} />}
        {indicatorParams && <IndicatorProvider params={indicatorParams} />}
      </div>
    );
  }
}

Economies.propTypes = {
  t: PropTypes.func.isRequired,
  chartData: PropTypes.object,
  tableData: PropTypes.array,
  tableConfig: PropTypes.object,
  indicatorParams: PropTypes.object,
  metadataParams: PropTypes.object,
  selectedOptions: PropTypes.object,
  filterOptions: PropTypes.object,
  provinceISO: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  selectedModel: PropTypes.string,
  sources: PropTypes.array
};

Economies.defaultProps = {
  chartData: undefined,
  tableData: undefined,
  tableConfig: undefined,
  indicatorParams: undefined,
  metadataParams: undefined,
  selectedOptions: undefined,
  filterOptions: undefined,
  selectedModel: undefined,
  sources: []
};

export default Economies;
