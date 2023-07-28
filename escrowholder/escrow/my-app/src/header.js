import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; 
import './Header.css'; 
import { NavLink } from 'react-router-dom';
import axios from 'axios';

function Header({ setAccount, account }) { // Receive setAccount and account as props
  const [darkMode, setDarkMode] = useState(false);
  
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  }

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setAccount('');
        localStorage.removeItem('account');
      } else {
        const account = accounts[0];
        setAccount(account);
        localStorage.setItem('account', account);
      }
    }
  }
  

  useEffect(() => {
    checkWalletConnection();
    const interval = setInterval(() => {
      checkWalletConnection();
    }, 1000); // Checks wallet connection every second

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  async function handleConnectWallet() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable().then(async function() {
        const accounts = await window.web3.eth.getAccounts();
        const account = accounts[0];
        if (account) {
          setAccount(account);  
          localStorage.setItem('account', account);
  
          // Log the wallet address
          console.log(`Wallet address: ${account}`);
  
          // Send wallet address to the server
          axios.post('http://localhost:5000/users/add', { wallet: account })
            .then((res) => {
              console.log('Response from server:', res);
            })
            .catch((error) => {
              console.error('Error posting to /users/add:', error);
            });
        }
      }).catch((error) => {
        console.log('MetaMask connection was cancelled by the user.');
      });
    } else {
      alert("Please install MetaMask!");
    }
  }
  

  return (
    <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
      <nav>
        <div className='headerdiv'>
          <ul>
            <li><NavLink to="/" className='home'>HOME</NavLink></li>
            <li><NavLink to="/escrow" className='escrow'>ESCROW</NavLink></li>
            <li><NavLink to="/transactions" className='transactions'>TRANSACTIONS</NavLink></li>
            <li>
              {account ?
                <span className='wallet-button'>{account.substring(0, 6) + '...' + account.substring(account.length - 5)}</span>
                :
                <button className='wallet-button' style={{ float: 'right' }} onClick={handleConnectWallet}>Connect Wallet</button>
              }
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
