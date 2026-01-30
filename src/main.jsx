import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom';

import './static/css/reset.css';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './static/css/global.css';

import { Provider } from 'react-redux';
import { Store } from './store';
import './i18n/config';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <Router>
    <Provider store={Store}>
      <App />
    </Provider>
  </Router>
  </React.StrictMode>,
)
