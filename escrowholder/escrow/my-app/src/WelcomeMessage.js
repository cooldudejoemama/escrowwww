// WelcomeMessage.js
import React from 'react';
import Typical from 'react-typical';
import './escrow.css';

function WelcomeMessage({account}) {

    const steps = account 
        ? [ 'WELCOME', 1000, '' ] 
        : ['CONNECT WALLET TO USE'];

    return (
        <div className="typing-container">
            <Typical loop={1} wrapper="h1" steps={steps}/>
        </div>
    );
}

export default WelcomeMessage;
