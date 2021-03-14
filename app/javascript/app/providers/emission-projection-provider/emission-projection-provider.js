import { connect } from 'react-redux';

import LocalizedProvider from 'providers/localized-provider';
import * as actions from './emission-projection-provider-actions';
import reducers, {
  initialState
} from './emission-projection-provider-reducers';

const mapDispatchToProps = { fetchData: actions.fetchEmissionProjection };

export const reduxModule = { actions, reducers, initialState };
export default connect(null, mapDispatchToProps)(LocalizedProvider);
