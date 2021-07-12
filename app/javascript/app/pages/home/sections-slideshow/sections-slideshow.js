/*
  filename: section-slideshow.js
  author: Anggia Ramadhan (anggia.ramadhan@gmail.com)
  repository: https://github.com/anggiaramadhan/indonesia-platform
*/

import { connect } from 'react-redux';
import { getLocale } from 'selectors/translation-selectors';
import withTranslations from 'providers/translations-provider/with-translations.hoc';
import Component from './sections-slideshow-component';

const mapStateToProps = state => ({ locale: getLocale(state) });

export default connect(mapStateToProps, null)(withTranslations(Component));
