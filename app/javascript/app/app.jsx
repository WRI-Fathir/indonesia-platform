import 'babel-polyfill';
import 'whatwg-fetch';
import 'cw-components/dist/main';

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import store from 'app/store';
import Root from './layouts/root';
import 'mapbox-gl/dist/mapbox-gl.css';

const App = ({ data }) => (
  <Provider store={store(data)}>
    <Root />
  </Provider>
);

App.propTypes = { data: PropTypes.object };

App.defaultProps = { data: {} };

export default App;
