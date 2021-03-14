import { connect } from 'react-redux';

import LocalizedProvider from 'providers/localized-provider';
import * as actions from './policies-provider-actions';
import reducers, { initialState } from './policies-provider-reducers';

const mapDispatchToProps = { fetchData: actions.fetchPolicies };

export const reduxModule = { actions, reducers, initialState };
export default connect(null, mapDispatchToProps)(LocalizedProvider);
