import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import SectionTitle from 'components/section-title';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import Chart from 'components/chart';
import { Dropdown, Button, Icon, Table } from 'cw-components';
import dropdownStyles from 'styles/dropdown';
import shareIcon from 'assets/icons/share';
import PoliciesProvider from 'providers/policies-provider';
import ModalShare from 'components/modal-share';

import castArray from 'lodash/castArray';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import styles from './policy-styles';


class Policy extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedCard: {
        label: "Tujuan",
        value: "tujuan",
      },
      cardOptions: [
        {
          label: 'Tujuan',
          value: 'tujuan'
        },
        {
          label: 'Sasaran',
          value: 'sasaran'
        }
      ],
      isOpen: false
    };
  }

  handleFilterChange = selected => {
    const { onFilterChange, selectedOptions } = this.props;

    const prevSelectedOptionValues = castArray(selectedOptions.indicator).map(
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

    onFilterChange({ indicator: values });
  };

  handleDropdownChange = (field, selected) => {
    this.setState({ [field]: selected });
  };

  renderCardData(field) {
    const { goals, objectives } = this.props;
    const data = field === 'goals' ? goals : objectives;
    return (
      <ul>
        {data.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    );
  }

  renderDropdown() {
    const { selectedOptions, filterOptions, t } = this.props;
    const value = selectedOptions && selectedOptions.indicator;
    const options = filterOptions.indicator || [];

    const label = t(`pages.regions.policy.section-two.labels.indicator`);

    return (
      <Dropdown
        key="indicator"
        label={label}
        options={options}
        onValueChange={selected => this.handleFilterChange(selected)}
        value={value || null}
        theme={{ select: dropdownStyles.select }}
        hideResetButton
      />
    );
  }

  renderChart() {
    const { chartData } = this.props;
    if (!chartData || !chartData.data) return null;

    return (
      <Chart
        type='line'
        config={chartData.config}
        theme={chartData.config.theme}
        data={chartData.data}
        dataOptions={chartData.dataOptions}
        dataSelected={chartData.dataSelected}
        loading={false}
        height={500}
        onLegendChange={v => this.handleLegendChange(v)}
        showUnit
      />
    );
  }

  renderTable() {
    const { tableData, tableConfig } = this.props
    if (!tableData) return null

    const setColumnWidth = () => 250

    return (
      <Table
        data={tableData}
        hasColumnSelect
        parseMarkdown
        firstColumnHeaders={tableConfig.firstColumnHeaders}
        narrowColumns={tableConfig.narrowColumns}
        emptyValueLabel='Data belum tersedia'
        defaultColumns={tableConfig.defaultColumns}
        horizontalScroll
        dinamicRowsHeight
        shouldOverflow
        setColumnWidth={setColumnWidth}
      />
    )
  }

  render() {
    const shareableLink = `${window.location.href}`
    const { t, params } = this.props;

    const { isOpen, selectedCard, cardOptions } = this.state

    return (
      <div className={styles.page}>
        <div className={styles.chartMapContainer}>
          <div>
            <SectionTitle
              title={t('pages.regions.policy.section-one.title')}
              description={t('pages.regions.policy.section-one.description')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>
              <Button
                theme={{ button: cx(styles.shareButton) }}
                onClick={() => this.setState({ isOpen: !isOpen })}
              >
                <Icon icon={shareIcon} />
                <span className={styles.shareText}>Share</span>
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.cardContainer}>
          <div>
            <div className={styles.dropdownContainer}>
              <div className={styles.dropdown}>
                <Dropdown
                  key="indicator"
                  label={t(`pages.regions.policy.section-two.labels.indicator`)}
                  placeholder="Filter by"
                  options={cardOptions}
                  onValueChange={value => this.handleDropdownChange('selectedCard', value)}
                  value={selectedCard}
                  theme={{ select: dropdownStyles.select }}
                  hideResetButton
                />
              </div>
            </div>
            {
              selectedCard.value === 'tujuan' && (
                <div>
                  <SectionTitle
                    title={t('pages.regions.policy.section-one.goals.title')}
                  />
                  <p>
                    {t('pages.regions.policy.section-one.goals.description')}
                  </p>
                  <br />
                  <div className={styles.card}>
                    {this.renderCardData('goals')}
                  </div>
                </div>
              )}
            {
              selectedCard.value === 'sasaran' && (
                <div>
                  <SectionTitle
                    title={t('pages.regions.policy.section-one.objectives.title')}
                  />
                  <p>
                    {t('pages.regions.policy.section-one.objectives.description')}
                  </p>
                  <br />
                  <div className={styles.card}>
                    {this.renderCardData('objectives')}
                  </div>
                </div>
              )}
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.dropdownContainer}>
              <div className={styles.dropdown}>
                {this.renderDropdown()}
              </div>
            </div>
            <div className={styles.chartMapContainer}>
              <div>
                <SectionTitle title={t('pages.regions.policy.section-two.title')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <InfoDownloadToolbox
                  className={{ buttonWrapper: styles.buttonWrapper }}
                  slugs={['RADGRK', 'SIGNSa']}
                  downloadUri='province/policies.zip'
                />
              </div>
            </div>
            <div className={styles.chartContainer}>
              {this.renderChart()}
            </div>
          </div>
          <div />
        </div>
        <div className={styles.chartContainer}>
          {this.renderTable()}
        </div>
        {params && <PoliciesProvider params={params} />}
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({ isOpen: false })} sharePath={shareableLink} />
      </div>
    );
  }
}

Policy.propTypes = {
  t: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func,
  selectedOptions: PropTypes.object,
  goals: PropTypes.array,
  objectives: PropTypes.array,
  filterOptions: PropTypes.object,
  chartData: PropTypes.object,
  tableData: PropTypes.array,
  tableConfig: PropTypes.object,
  params: PropTypes.object
};

Policy.defaultProps = {
  onFilterChange: undefined,
  selectedOptions: undefined,
  goals: undefined,
  objectives: undefined,
  filterOptions: undefined,
  chartData: undefined,
  tableData: undefined,
  tableConfig: undefined,
  params: undefined
};

export default Policy;