/*
  filename: ghg-map.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';

import Component from './ghg-map-component';
import { getMap } from './ghg-map-selectors';
import * as actions from './ghg-map-actions';

const mapStateToProps = getMap;

export default connect(mapStateToProps, actions)(Component);
