import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LocalizedProvider from 'providers/localized-provider';
import * as actions from './ghg-inventory-metadata-provider-actions';
import reducers, {
  initialState
} from './ghg-inventory-metadata-provider-reducers';

function MetaProvider({ fetchMeta, params }) {
  return <LocalizedProvider fetchData={fetchMeta} params={params} />;
}

MetaProvider.propTypes = {
  params: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]).isRequired,
  fetchMeta: PropTypes.func.isRequired
};

export const reduxModule = { actions, reducers, initialState };
export default connect(null, actions)(MetaProvider);
