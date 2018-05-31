import React from 'react';
import ReactDOM from 'react-dom';
import App from './App/App';
import { unregister } from './registerServiceWorker';
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './store'
import { Provider } from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>
  , document.getElementById('root'));
unregister();
