/*
  filename: population-map.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';

import Component from './population-map-component';
import { getMap } from './population-map-selectors';
import * as actions from './population-map-actions';

const mapStateToProps = getMap;

export default connect(mapStateToProps, actions)(Component);
