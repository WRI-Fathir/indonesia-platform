/*
  filename: population-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SectionTitle from 'components/section-title';
import InfoDownloadToolbox from 'components/info-download-toolbox';
import Chart from 'components/chart';
import { Dropdown, Button, Icon } from 'cw-components';
import ModalShare from 'components/modal-share';
import cx from 'classnames'

import dropdownStyles from 'styles/dropdown';
import CustomTooltip from '../bar-chart-tooltip';
import shareIcon from 'assets/icons/share';
import styles from './population-styles';

class Population extends PureComponent {
  constructor(props) {
    super(props);
  
    this.state = {
      isOpen: false
    };
  }

  render() {
    const {
      t,
      chartData,
      onLegendChange,
      onIndicatorChange,
      nationalIndicatorsOptions,
      selectedIndicator,
      sources,
      downloadURI
    } = this.props;

    const shareableLink = `${window.location.origin}${window.location.pathname}#population`
    const { isOpen } = this.state
    const nationalIndLabel = t(
      'pages.national-context.socioeconomic.labels.national-indicators'
    );
    return (
      <div className={styles.page} id="population">
        <SectionTitle
          title={t('pages.national-context.socioeconomic.population.title')}
          description={t(
            'pages.national-context.socioeconomic.population.description'
          )}
        />
        <div className={styles.container}>
          <div>
            <div className={styles.toolbox}>
              <div className={styles.dropdown}>
                <Dropdown
                  key={nationalIndLabel}
                  label={nationalIndLabel}
                  placeholder={`Filter by ${nationalIndLabel}`}
                  options={nationalIndicatorsOptions}
                  onValueChange={onIndicatorChange}
                  value={selectedIndicator}
                  theme={{ select: dropdownStyles.select }}
                  hideResetButton
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            </div>
            {
              chartData &&
                (
                  <Chart
                    type="bar"
                    config={chartData.config}
                    data={chartData.data}
                    theme={{ legend: styles.legend }}
                    customTooltip={<CustomTooltip />}
                    getCustomYLabelFormat={chartData.config.yLabelFormat}
                    domain={chartData.domain}
                    dataOptions={chartData.dataOptions}
                    dataSelected={chartData.dataSelected}
                    height={300}
                    barSize={30}
                    customMessage={t('common.chart-no-data')}
                    onLegendChange={onLegendChange}
                  />
                )
            }
          </div>
        </div>
        <ModalShare isOpen={isOpen} closeModal={() => this.setState({ isOpen: false })} sharePath={shareableLink} />
      </div>
    );
  }
}

Population.propTypes = {
  t: PropTypes.func.isRequired,
  onLegendChange: PropTypes.func.isRequired,
  onIndicatorChange: PropTypes.func.isRequired,
  chartData: PropTypes.object,
  selectedIndicator: PropTypes.object,
  nationalIndicatorsOptions: PropTypes.array.isRequired,
  sources: PropTypes.array.isRequired,
  downloadURI: PropTypes.string.isRequired
};

Population.defaultProps = { selectedIndicator: {}, chartData: null };

export default Population;
