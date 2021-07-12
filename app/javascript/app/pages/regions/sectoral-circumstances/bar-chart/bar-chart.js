/*
  filename: bar-chart.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { getTranslate } from 'selectors/translation-selectors';
import { connect } from 'react-redux';
import Component from './bar-chart-component';

const mapStateToProps = state => ({ t: getTranslate(state) });

export default connect(mapStateToProps, null)(Component);
