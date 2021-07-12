/*
  filename: climate-plans-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Table, NoContent } from 'cw-components';
import uniq from 'lodash/uniq';

import { renameKeys } from 'utils';
import ClimatePlansProvider from 'providers/climate-plans-provider';
import InfoDownloadToolbox from 'components/info-download-toolbox';

import styles from './climate-plans-styles.scss';

class ClimatePlans extends PureComponent {
  renderTable(nt) {
    const { data, t } = this.props;
    const hasContent = data && data.length > 0;

    if (!hasContent) {
      return <NoContent minHeight={330} message={t('common.table-no-data')} />;
    }

    const tableHeaders = nt('climate-plans-table-headers', {});
    const defaultColumns = Object.values(tableHeaders);

    console.log('default column', defaultColumns)
    console.log('data', data)
    const tableData = data.map(d => renameKeys(d, tableHeaders));
    console.log('tabledata', tableData)

    return (
      <Table
        data={tableData}
        defaultColumns={defaultColumns}
        setColumnWidth={() => 300}
        ellipsisColumns={[ tableHeaders.description ]}
        emptyValueLabel={t('common.table-empty-value')}
        horizontalScroll
        parseMarkdown
      />
    );
  }

  render() {
    const { t, data, handleFilterChange, provinceIso } = this.props;
    // namespaced t
    const nt = key => t(`pages.regions.climate-sectoral-plan.${key}`);
    const sources = data && data.length && uniq(data.map(d => d.source)) || [];
    const documentURL = `http://wri-sites.s3.amazonaws.com/climatewatch.org/www.climatewatch.org/indonesia/documents/climate-plans/${provinceIso}.pdf`;

    return (
      <div>
        <div className={styles.subheaderSection}>
          <a
            href={documentURL}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('pages.regions.climate-sectoral-plan.document-link-title')}
          </a>
        </div>
        <div className={styles.actions}>
          <Input
            onChange={value => handleFilterChange('search', value)}
            placeholder={nt('search-placeholder')}
            theme={styles}
          />
          <InfoDownloadToolbox
            className={{ buttonWrapper: styles.buttonWrapper }}
            slugs={sources}
            downloadUri="province/climate_plans.zip"
            infoTooltipdata={t('common.table-data-info')}
            downloadTooltipdata={t('common.download-table-data-info')}
          />
        </div>
        <div className={styles.tableContainer}>
          {this.renderTable(nt)}
        </div>
        <ClimatePlansProvider />
      </div>
    );
  }
}

ClimatePlans.propTypes = {
  handleFilterChange: PropTypes.func,
  data: PropTypes.array,
  t: PropTypes.func,
  provinceIso: PropTypes.string.isRequired
};

ClimatePlans.defaultProps = {
  handleFilterChange: () => {
  },
  data: [],
  t: () => {
  }
};

export default ClimatePlans;
