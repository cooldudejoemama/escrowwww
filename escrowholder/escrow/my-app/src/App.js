import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './header';
import HomePage from './HomePage';
import Escrow from './escrow';
import TradeRequests from './TradeRequests';
import TradeInterface from './TradeInterface';
import './App.css';

function App() {
  // Initialize state
  const [account, setAccount] = useState(localStorage.getItem('account') || '');

  return (
    <Router>
      <div className="App">
        <Header setAccount={setAccount} account={account} />
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route path="/escrow">
            <Escrow account={account} /> {/* Removed socket as a prop */}
          </Route>
          <Route path="/trade-requests">
            <TradeRequests receiverAddress={account} /> {/* Removed socket as a prop */}
          </Route>
          <Route path="/trade-interface/:tradeId">
            <TradeInterface account={account} /> {/* Pass account as a prop */}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
