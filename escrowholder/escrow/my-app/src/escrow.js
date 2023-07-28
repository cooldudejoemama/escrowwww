// Escrow.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WelcomeMessage from './WelcomeMessage';
import EscrowInterface from './EscrowInterface';

function Escrow({ account }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEscrow, setShowEscrow] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    setShowWelcome(true);
    setShowEscrow(false);
    let timeoutId;
    if (account) {
      timeoutId = setTimeout(() => {
        setShowWelcome(false);
        setShowEscrow(true);
      }, 3750);
    }
    return () => clearTimeout(timeoutId);
  }, [account]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/${account}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  
    fetchData();
  }, [account]);
  

  return (
    <div>
      {showWelcome && <WelcomeMessage account={account} />}
      {showEscrow && <EscrowInterface account={account} data={data} />}
    </div>
  );
}

export default Escrow;
