/*
  filename: sectoral-information-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import NDCCountryAccordion from 'components/ndcs-country-accordion';

// eslint-disable-next-line react/prefer-stateless-function
class Sectoral extends PureComponent {
  render() {
    return <NDCCountryAccordion category="sectoral_information" />;
  }
}

Sectoral.propTypes = {};

Sectoral.defaultProps = {};

export default Sectoral;
