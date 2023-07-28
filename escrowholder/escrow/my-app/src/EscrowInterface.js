import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './EscrowInterface.css';
import TradeRequests from './TradeRequests';

function EscrowInterface() {
  const [otherWallet, setOtherWallet] = useState('');
  const [requests, setRequests] = useState([]);
  const history = useHistory();

  // Getting the account from local storage
  const account = localStorage.getItem('account');

  useEffect(() => {
    if (!account) return;

    const getTradeRequests = async () => {
      try {
        console.log('Fetching trade requests...');
        const res = await axios.get(`http://localhost:5000/trade-requests/${account}`);
        console.log('Received trade requests:', JSON.stringify(res.data, null, 2));
        
        if (Array.isArray(res.data.tradeRequests)) {
          setRequests(res.data.tradeRequests);
        } else {
          console.log('Error: trade requests data is not an array:', res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    getTradeRequests();
  }, [account, history]);

  const handleInputChange = (event) => {
    setOtherWallet(event.target.value);
  };

  const handleTradeRequest = async () => {
    try {
      const res = await axios.post('http://localhost:5000/trade-requests', {
        sender: account,
        receiver: otherWallet,
      });
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='main'>
      <div className='wallets'>
        <div className='container1'>
          <h1>Your Wallet:</h1>
          <p>{account || 'Not connected'}</p>
        </div>
        <div className='container2'>
          <h1>Other Wallet:</h1>
          <input type="text" value={otherWallet} onChange={handleInputChange} placeholder="Enter Wallet Address Here"/>
        </div>
      </div>
      <div className='container3'>
        <button onClick={handleTradeRequest}>Click to Request Trade</button>
      </div>
      <TradeRequests receiverAddress={account} requests={requests} setRequests={setRequests} />
    </div>
  );
}

export default EscrowInterface;
