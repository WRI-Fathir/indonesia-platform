import { connect } from 'react-redux';
import { getTranslate } from 'selectors/translation-selectors';
import Component from './nav-nested-menu-component';

const mapStateToProps = state => ({
  t: getTranslate(state)
});

export default connect(mapStateToProps, null)(Component);
