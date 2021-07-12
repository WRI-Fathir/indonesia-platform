/*
  filename: agriculture-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Card from 'components/card';
import CardHeader from '../card-header';
import BarChart from '../bar-chart';

import styles from './agriculture-styles.scss';

class Agriculture extends PureComponent {
  render() {
    const {
      t,
      harvestedAreaChartData,
      harvestedAreaIndicatorName,
      harvestedAreaSources,
      harvestedAreaDownloadURI,
      populationChartData,
      populationIndicatorName,
      populationSources,
      populationDownloadURI
    } = this.props;

    return (
      <React.Fragment>
        <h2 className={styles.title}>
          {t('pages.regions.sectoral-circumstances.agriculture.title')}
        </h2>
        <div className={styles.cardWrapper}>
          <Card
            header={
              (
                <CardHeader
                  title={harvestedAreaIndicatorName}
                  infoSlugs={harvestedAreaSources}
                  infoDownloadURI={harvestedAreaDownloadURI}
                />
              )
            }
          >
            <BarChart chartData={harvestedAreaChartData} />
          </Card>
        </div>
        <div className={styles.cardWrapper}>
          <Card
            header={
              (
                <CardHeader
                  title={populationIndicatorName}
                  infoSlugs={populationSources}
                  infoDownloadURI={populationDownloadURI}
                />
              )
            }
          >
            <BarChart chartData={populationChartData} />
          </Card>
        </div>
      </React.Fragment>
    );
  }
}

Agriculture.propTypes = {
  t: PropTypes.func.isRequired,
  harvestedAreaChartData: PropTypes.object,
  harvestedAreaIndicatorName: PropTypes.string,
  harvestedAreaSources: PropTypes.array,
  harvestedAreaDownloadURI: PropTypes.string,
  populationChartData: PropTypes.object,
  populationIndicatorName: PropTypes.string,
  populationSources: PropTypes.array,
  populationDownloadURI: PropTypes.string
};

Agriculture.defaultProps = {
  harvestedAreaChartData: {},
  harvestedAreaIndicatorName: '',
  harvestedAreaSources: [],
  harvestedAreaDownloadURI: null,
  populationChartData: {},
  populationIndicatorName: '',
  populationSources: [],
  populationDownloadURI: null
};

export default Agriculture;
