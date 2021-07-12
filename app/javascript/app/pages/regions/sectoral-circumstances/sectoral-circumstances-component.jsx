/*
  filename: sectoral-circumtances-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SectionTitle from 'components/section-title';
import IndicatorsProvider from 'providers/indicators-provider';
import styles from './sectoral-circumstances-styles.scss';

import Forestry from './forestry';
import Energy from './energy';
import Agriculture from './agriculture';

class SectoralCircumstances extends PureComponent {
  render() {
    const { t } = this.props;
    return (
      <div className={styles.page}>
        <SectionTitle
          title={t('pages.regions.sectoral-circumstances.title')}
          description={t('pages.regions.sectoral-circumstances.description')}
        />
        <Forestry />
        <Energy />
        <Agriculture />
        <IndicatorsProvider />
      </div>
    );
  }
}

SectoralCircumstances.propTypes = { t: PropTypes.func.isRequired };

SectoralCircumstances.defaultProps = {};

export default SectoralCircumstances;
