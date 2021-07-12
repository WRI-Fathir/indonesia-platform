/*
  filename: overview-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'cw-components';
import cx from 'classnames';
import NdcContentOverviewProvider from 'providers/ndc-content-overview-provider';
import SectionTitle from 'components/section-title';
import get from 'lodash/get';
import Timeline from './timeline';
import styles from './overview-styles.scss';

class Overview extends PureComponent {
  renderCards = () => {
    const { sectors, values, t, nonGhgMitigationCards } = this.props;
    const renderSubtitle = text => <h4 className={styles.subTitle}>{text}</h4>;
    const renderNoContent = () => (
      <div className={styles.noContent}>{t('common.no-card-content')}</div>
    );
    const cardTheme = {
      card: styles.card,
      contentContainer: styles.contentContainer,
      data: styles.data
    };

    const renderGhgCard = () => (
      <Card
        reverse
        theme={cardTheme}
        title={t('pages.climate-goals.overview.card-ghg')}
      >
        <div className={styles.cardContent}>
          {
            values && values.ghg_target_type ? (
              <React.Fragment>
                <span className={styles.metaTitle}>
                  {t('pages.climate-goals.overview.target-type')}
                </span>
                <p
                  className={styles.targetText}
                  dangerouslySetInnerHTML={{
                    __html: values.ghg_target_type[0].value
                  }}
                />
                <span className={styles.metaTitle}>
                  {t('pages.climate-goals.overview.target-year')}
                </span>
                <p
                  className={styles.targetText}
                  dangerouslySetInnerHTML={{
                    __html: values.time_target_year[0].value
                  }}
                />
              </React.Fragment>
) : renderNoContent()
          }
        </div>
      </Card>
    );

    const renderCard = (title, type) => (
      <Card reverse theme={cardTheme} title={title}>
        <div className={styles.cardContent}>
          {
            values && values[type]
              ? (
                <p
                  className={styles.targetText}
                  dangerouslySetInnerHTML={{ __html: values[type][0].value }}
                />
)
              : renderNoContent()
          }
        </div>
      </Card>
    );

    return (
      <div className="grid-column-item">
        <div className={styles.subtitles}>
          {renderSubtitle(
            t('pages.climate-goals.overview.mitigation-contribution')
          )}
        </div>
        <div className={styles.cards}>
          {renderGhgCard()}
          {
            nonGhgMitigationCards &&
              nonGhgMitigationCards.map(
                card => renderCard(card.title, card.type)
              )
          }
        </div>
        <div className={cx(styles.subtitles, styles.adaptationSubtitles)}>
          {renderSubtitle(
            t('pages.climate-goals.overview.adaptation-contribution')
          )}
        </div>
        <div className={cx(styles.adaptationList, styles.adaptation)}>
          <Card
            reverse
            theme={{
              card: styles.card,
              contentContainer: styles.contentContainer,
              data: styles.adaptationData
            }}
            title={t('pages.climate-goals.overview.card-adaptation-action')}
          >
            <div className={styles.cardContent}>
              {
                sectors.length ? (
                  <ul className={styles.list}>
                    {sectors.map(sector => (
                      <li key={sector} className={styles.listItem}>
                        {sector}
                      </li>
                    ))}
                  </ul>
) : renderNoContent()
              }
            </div>
          </Card>
        </div>
      </div>
    );
  };

  render() {
    const { sectors, values, t } = this.props;
    const hasSectors = values && sectors;

    const description = hasSectors && (
    <p
      className={styles.descriptionContainer}
          /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
            __html: get(values, 'indc_summary[0].value')
          }}
    />
      );

    return (
      <React.Fragment>
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <SectionTitle
              title={t('pages.climate-goals.overview.overview-title')}
            />
          </div>
          <div className={styles.description}>
            {description}
          </div>
          {this.renderCards()}
          <h4 className={styles.subTitle}>
            {t('pages.climate-goals.overview.timeline-title')}
          </h4>
          <NdcContentOverviewProvider />
        </div>
        <div className={styles.timelineContainer}>
          <div className={styles.page}>
            <Timeline />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Overview.propTypes = {
  sectors: PropTypes.array,
  values: PropTypes.object,
  nonGhgMitigationCards: PropTypes.array,
  t: PropTypes.func.isRequired
};

Overview.defaultProps = { sectors: [], values: {}, nonGhgMitigationCards: [] };

export default Overview;
