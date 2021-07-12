/*
  filename: timeline.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';
import Component from './timeline-component';
import { getTimeline } from './timeline-selectors';

const mapStateToProps = getTimeline;

export default connect(mapStateToProps, null)(Component);
