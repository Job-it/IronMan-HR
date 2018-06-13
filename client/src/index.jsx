import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
<BrowserRouter>
  <App location = { location }/>
</BrowserRouter>, 
document.getElementById('app'));