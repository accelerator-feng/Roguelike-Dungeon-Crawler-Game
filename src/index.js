import React from 'react';
import ReactDOM from 'react-dom';
import RogueLike from './components/RogueLike';
import createMap from './utils/createMap';

import './index.css';

ReactDOM.render(
  <RogueLike mapAlgo={createMap} />,
  document.getElementById('root'),
);
