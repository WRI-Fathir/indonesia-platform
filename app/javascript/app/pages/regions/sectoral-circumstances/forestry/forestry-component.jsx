/*
  filename: forestry-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Card from 'components/card';
import CardHeader from '../card-header';
import BarChart from '../bar-chart';

import styles from './forestry-styles.scss';

class Forestry extends PureComponent {
  render() {
    const { t, chartData, indicatorName, downloadURI, sources } = this.props;

    return (
      <React.Fragment>
        <h2 className={styles.title}>
          {t('pages.regions.sectoral-circumstances.forestry.title')}
        </h2>
        <div className={styles.cardWrapper}>
          <Card
            header={
              (
                <CardHeader
                  title={indicatorName}
                  infoSlugs={sources}
                  infoDownloadURI={downloadURI}
                />
              )
            }
          >
            <BarChart chartData={chartData} />
          </Card>
        </div>
      </React.Fragment>
    );
  }
}

Forestry.propTypes = {
  t: PropTypes.func.isRequired,
  chartData: PropTypes.object,
  indicatorName: PropTypes.string,
  sources: PropTypes.array,
  downloadURI: PropTypes.string
};

Forestry.defaultProps = {
  chartData: {},
  indicatorName: '',
  downloadURI: null,
  sources: []
};

export default Forestry;
