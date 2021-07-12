/*
  filename: socioeconomic-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import IndicatorsProvider from 'providers/indicators-provider';
// import styles from './socioeconomic-styles.scss';
import Population from './population';
import Economy from './economy';
import Energy from './energy';

class Socioeconomic extends PureComponent {
  render() {
    return (
      <React.Fragment>
        <Population />
        <Economy />
        <Energy />
        <IndicatorsProvider />
      </React.Fragment>
    );
  }
}

Socioeconomic.propTypes = {};

Socioeconomic.defaultProps = {};

export default Socioeconomic;
