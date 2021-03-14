import { connect } from 'react-redux';

import Component from './regions-map-component';
import { getMap } from './regions-map-selectors';
import * as actions from './regions-map-actions';

const mapStateToProps = getMap;

export default connect(mapStateToProps, actions)(Component);
