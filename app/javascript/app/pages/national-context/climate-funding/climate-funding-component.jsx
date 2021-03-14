import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Table, Dropdown, Button, Icon } from 'cw-components';
import ModalShare from 'components/modal-share';
import cx from 'classnames'
import kebabCase from 'lodash/kebabCase';
import startCase from 'lodash/startCase';
import castArray from 'lodash/castArray';
import filter from 'lodash/filter'
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import { renameKeys } from 'utils';
import SectionTitle from 'components/section-title';
import FundingOportunitiesProvider from 'providers/funding-oportunities-provider';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import shareIcon from 'assets/icons/share';
import styles from './climate-funding-styles.scss';
import dropdownStyles from 'styles/dropdown.scss';

const setColumnWidth = columnName => {
  const narrowColumns = [ 'website_link' ];
  if (narrowColumns.includes(columnName)) return 80;
  return null;
};

class ClimateFunding extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      isOpen: false,
      selectedSector: {
        label: '',
        value: ''
      },
      selectedSupport: {
        label: '',
        value: ''
      },
      searchValue: '',
      data: [],
      filteredData: []
    };
  }

  componentDidUpdate(prevProps) {
    if(this.props.data !== prevProps.data) {
      this.setState({
        data: this.props.data
      })
    }
  }

  filterData() {
    const {selectedSector, selectedSupport } = this.state
    const { data } = this.props

    const filteredData = filter(data, function(item) {
      return item.sectors_and_topics.indexOf(selectedSector.value) !== -1
        && item.mode_of_support.indexOf(selectedSupport.value) !== -1
    })

    this.setState({
      data: filteredData
    })
  }

  handleFilterChange = (field, selected) => {
    const { onSearchChange } = this.props;
    const value = selected.value
    // this.filterData(value)
    if(field === 'sector'){
      this.setState({
        selectedSector: selected
      }, () => {
        this.filterData()
      })
    } else {
      this.setState({
        selectedSupport: selected
      }, () => {
        this.filterData()
      })
    }
  };

  handleSearch = (value) => {
    const { onSearchChange } = this.props;
    onSearchChange(value);
    this.filterData()
  }

  renderDropdown(field, multi, icons) {
    const {
      t,
    } = this.props;

    const { selectedSector, selectedSupport } = this.state 
    const { supports, sectors } = this.props

    let options = []
    let value = {}
    if(field === 'sector') {
      options = sectors
      value = selectedSector
    } else {
      options = supports
      value = selectedSupport
    }

    const label = t(
      `pages.national-context.climate-funding.labels.${kebabCase(field)}`
    );

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
      />
    );
  }

  render() {
    const shareableLink = `${window.location.origin}${window.location.pathname}`
    const { isOpen } = this.state
    const { t, titleLinks, onSearchChange, sources } = this.props;
    const { data } = this.state;
    const nt = key => t(`pages.national-context.climate-funding.${key}`);

    const tableHeaders = nt('table-headers', {});
    tableHeaders.website_link = 'website_link';
    const defaultColumns = Object.values(tableHeaders);

    const tableData = data.map(d => renameKeys(d, tableHeaders));
    const title = nt('title');
    const description = nt('description');

    return (
      <div className={styles.page}>
        <SectionTitle title={title} description={description} />
        <div>
          <div className={styles.actions}>
            <Input
              onChange={value => this.handleSearch(value)}
              placeholder={t(
                'pages.national-context.climate-funding.search-placeholder'
              )}
              theme={styles}
            />
            <div style={{ width: '300px' }}>
              {this.renderDropdown('support', false)}
            </div>
            <div style={{ width: '300px' }}>
              {this.renderDropdown('sector', false)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
              <InfoDownloadToolbox
                className={{ buttonWrapper: styles.buttonWrapper }}
                slugs={sources}
                downloadUri="funding_opportunities.zip"
                infoTooltipdata={t('common.table-data-info')}
                downloadTooltipdata={t('common.download-table-data-info')}
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
          <div className={styles.tableContainer}>
            <Table
              data={tableData && tableData}
              defaultColumns={defaultColumns}
              ellipsisColumns={[ tableHeaders.description ]}
              emptyValueLabel={t('common.table-empty-value')}
              dynamicRowsHeight
              hiddenColumnHeaderLabels={[ tableHeaders.website_link ]}
              titleLinks={data && titleLinks}
              setColumnWidth={setColumnWidth}
            />
          </div>
        </div>
        <FundingOportunitiesProvider />
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({ isOpen: false })} sharePath={shareableLink} />
      </div>
    );
  }
}

ClimateFunding.propTypes = {
  t: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  data: PropTypes.array,
  titleLinks: PropTypes.array,
  sources: PropTypes.array
};

ClimateFunding.defaultProps = { data: [], titleLinks: null, sources: [] };

export default ClimateFunding;
