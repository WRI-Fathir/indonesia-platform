/*
  filename: adaptation-component.jsx
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import React, { PureComponent } from 'react';
import NDCCountryAccordion from 'components/ndcs-country-accordion';

// eslint-disable-next-line react/prefer-stateless-function
class Adaptation extends PureComponent {
  render() {
    return <NDCCountryAccordion category="adaptation" />;
  }
}

Adaptation.propTypes = {};

Adaptation.defaultProps = {};

export default Adaptation;
