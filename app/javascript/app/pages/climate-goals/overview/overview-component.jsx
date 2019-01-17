import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Icon } from 'cw-components';
import cx from 'classnames';
import openInNewIcon from 'assets/icons/open_in_new';
import NdcContentOverviewProvider from 'providers/ndc-content-overview-provider';
import SectionTitle from 'components/section-title';
import button from 'styles/themes/button';
import Timeline from './timeline';
import styles from './overview-styles.scss';

const COMPARE_INDONESIA_NDC_LINK = 'https://www.climatewatchdata.org/ndcs/compare/overview?locations=IDN';

class Overview extends PureComponent {
  handleBtnClick = () => {
    window.open(COMPARE_INDONESIA_NDC_LINK, '_blank');
  };

  renderCards() {
    const { sectors, values, t } = this.props;
    const renderSubtitle = text => <h4 className={styles.subTitle}>{text}</h4>;
    const renderNoContent = () => (
      <div className={styles.noContent}>{t('common.no-card-content')}</div>
    );
    const cardTheme = {
      card: styles.card,
      contentContainer: styles.contentContainer,
      data: styles.data
    };
    return (
      <div className="grid-column-item">
        <div className={styles.row}>
          <div className="layout-card-container">
            <div className={styles.subtitles}>
              {renderSubtitle(
                t('pages.climate-goals.overview.mitigation-contribution')
              )}
            </div>
            <div className={styles.cards}>
              <div className="grid-column-item">
                <div className={styles.cardsRowContainer}>
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
                  <Card
                    reverse
                    theme={cardTheme}
                    title={t('pages.climate-goals.overview.card-non-ghg')}
                  >
                    <div className={styles.cardContent}>
                      {
                        values && values.non_ghg_target
                          ? (
                            <p
                              className={styles.targetText}
                              dangerouslySetInnerHTML={{
                              __html: values.non_ghg_target[0].value
                            }}
                            />
)
                          : renderNoContent()
                      }
                    </div>
                  </Card>
                  <Card
                    reverse
                    theme={cardTheme}
                    title={t(
                      'pages.climate-goals.overview.card-mitigation-action'
                    )}
                  >
                    <div className={styles.cardContent}>
                      {
                        values && values.coverage_sectors_short
                          ? (
                            <p
                              className={styles.targetText}
                              dangerouslySetInnerHTML={{
                              __html: values.coverage_sectors_short[0].value
                            }}
                            />
)
                          : renderNoContent()
                      }
                    </div>
                  </Card>
                </div>
              </div>
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
        </div>
      </div>
    );
  }

  render() {
    const { sectors, values, t } = this.props;
    const hasSectors = values && sectors;

    const description = hasSectors && (
    <p
      className={styles.descriptionContainer}
          /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
            __html: values.indc_summary &&
              values.indc_summary[0] &&
              values.indc_summary[0].value
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
            <Button
              onClick={this.handleBtnClick}
              theme={{ button: cx(button.primary, styles.button) }}
            >
              <span
                className={styles.buttonText}
                dangerouslySetInnerHTML={{
                  __html: t('pages.climate-goals.overview.button-title')
                }}
              />
              <Icon icon={openInNewIcon} />
            </Button>
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
  t: PropTypes.func.isRequired
};

Overview.defaultProps = { sectors: [], values: {} };

export default Overview;
