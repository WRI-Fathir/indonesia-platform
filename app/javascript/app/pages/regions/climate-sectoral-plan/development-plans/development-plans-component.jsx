/*
  filename: development-plans-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import PropTypes from 'prop-types';
import { Input, Table, NoContent } from 'cw-components';
import uniq from 'lodash/uniq';

import { renameKeys } from 'utils';
import DevelopmentPlansProvider from 'providers/development-plans-provider';
import InfoDownloadToolbox from 'components/info-download-toolbox';

import styles from '../climate-plans/climate-plans-styles';

class DevelopmentPlans extends PureComponent {
  renderDescription() {
    const { t, subheaderDescription, provinceIso } = this.props;
    const fileURL = `http://wri-sites.s3.amazonaws.com/climatewatch.org/www.climatewatch.org/indonesia/documents/development-plans/${provinceIso}.pdf`;

    return (
      <div className={styles.subheaderSection}>
        <h2 className={styles.subheader}>
          {t('pages.regions.climate-sectoral-plan.development-plans-subheader')}
        </h2>
        <ReactMarkdown
          className={styles.description}
          escapeHtml={false}
          source={subheaderDescription}
        />
        <a
          href={fileURL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {t('pages.regions.climate-sectoral-plan.document-link-title')}
        </a>
      </div>
    );
  }

  renderTable(nt) {
    const { data, t } = this.props;
    const hasContent = data && data.length > 0;

    if (!hasContent) {
      return <NoContent minHeight={330} message={t('common.table-no-data')} />;
    }

    const tableHeaders = nt('development-plans-table-headers', {});
    const defaultColumns = Object.values(tableHeaders);

    const tableData = data.map(d => renameKeys(d, tableHeaders));

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
    const { handleFilterChange, data, t } = this.props;
    // namespaced t
    const nt = key => t(`pages.regions.climate-sectoral-plan.${key}`);
    const sources = uniq(data.map(d => d.source));

    return (
      <div className={styles.page}>
        {this.renderDescription()}
        <div className={styles.actions}>
          <Input
            onChange={value => handleFilterChange('search', value)}
            placeholder={nt('search-placeholder')}
            theme={styles}
          />
          <InfoDownloadToolbox
            className={{ buttonWrapper: styles.buttonWrapper }}
            slugs={sources}
            downloadUri="province/development_plans.zip"
            infoTooltipdata={t('common.table-data-info')}
            downloadTooltipdata={t('common.download-table-data-info')}
          />
        </div>
        <div className={styles.tableContainer}>
          {this.renderTable(nt)}
        </div>
        <DevelopmentPlansProvider />
      </div>
    );
  }
}

DevelopmentPlans.propTypes = {
  handleFilterChange: PropTypes.func,
  data: PropTypes.array,
  t: PropTypes.func,
  provinceIso: PropTypes.string.isRequired,
  subheaderDescription: PropTypes.string
};

DevelopmentPlans.defaultProps = {
  handleFilterChange: () => {
  },
  data: [],
  t: () => {
  },
  subheaderDescription: ''
};

export default DevelopmentPlans;
