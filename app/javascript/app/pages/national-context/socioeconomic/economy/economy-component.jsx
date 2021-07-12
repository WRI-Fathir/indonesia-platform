/*
  filename: economy-component.jsx
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
import styles from './economy-styles';

class Economy extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  render() {
    const shareableLink = `${window.location.origin}${window.location.pathname}#economy`
    const { isOpen } = this.state

    const {
      t,
      chartData,
      onIndicatorChange,
      onLegendChange,
      indicatorOptions,
      selectedIndicator,
      sources,
      downloadURI
    } = this.props;

    const nationalIndLabel = t(
      'pages.national-context.socioeconomic.labels.national-indicators'
    );
    const provinceIndLabel = t(
      'pages.national-context.socioeconomic.labels.province-indicators'
    );

    return (
      <div className={styles.page} id="economy">
        <SectionTitle
          title={t('pages.national-context.socioeconomic.economic.title')}
          description={t(
            'pages.national-context.socioeconomic.economic.description'
          )}
        />
        <div className={styles.container}>
          <div className="first-column">
            <div className={styles.toolbox}>
              <div className={styles.dropdown}>
                <Dropdown
                  key={nationalIndLabel}
                  label={provinceIndLabel}
                  options={indicatorOptions}
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
                    type="line"
                    dots={false}
                    lineType="linear"
                    config={chartData.config}
                    theme={{ legend: styles.legend }}
                    customTooltip={<CustomTooltip />}
                    dataOptions={chartData.dataOptions}
                    dataSelected={chartData.dataSelected}
                    getCustomYLabelFormat={chartData.config.yLabelFormat}
                    data={chartData.data}
                    domain={chartData.domain}
                    height={300}
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

Economy.propTypes = {
  t: PropTypes.func.isRequired,
  onIndicatorChange: PropTypes.func.isRequired,
  onLegendChange: PropTypes.func.isRequired,
  chartData: PropTypes.object,
  indicatorOptions: PropTypes.array,
  selectedIndicator: PropTypes.object,
  sources: PropTypes.array,
  downloadURI: PropTypes.string
};

Economy.defaultProps = {
  chartData: {},
  indicatorOptions: [],
  selectedIndicator: {},
  sources: [],
  downloadURI: ''
};

export default Economy;
