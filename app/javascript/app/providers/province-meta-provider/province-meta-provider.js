import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LocalizedProvider from 'providers/localized-provider';
import * as actions from './province-meta-actions';
import reducers, { initialState } from './province-meta-reducers';

function ProvinceMetaProvider({ fetchProvinceMetas, metaParams}) {
  return <LocalizedProvider fetchData={fetchProvinceMetas} params={{ metaParams }} />;
}

ProvinceMetaProvider.propTypes = {
  metaParams: PropTypes.object.isRequired,
  fetchProvinceMetas: PropTypes.func.isRequired
};

export const reduxModule = { actions, reducers, initialState };
export default connect(null, actions)(ProvinceMetaProvider);