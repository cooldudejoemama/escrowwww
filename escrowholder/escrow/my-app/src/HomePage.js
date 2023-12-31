import React from 'react';
import './App.css';

console.log("dev")

function HomePage() {
  return (
    <div className='content'>
        <h2>HOW IT WORKS</h2>
        <div className='twoway'>
          <h3>1. TWO-WAY ESCROW</h3>
          <p>EXPERIENCE THE ULTIMATE IN SIMPLICITY AND EFFICIENCY WITH OUR TWO-WAY ESCROW SERVICE. DESIGNED FOR SEAMLESS, SECURE DIGITAL ASSET SWAPS, THIS METHOD ALLOWS BOTH PARTIES TO DEPOSIT THEIR ETHEREUM-BASED TOKENS INTO A SECURE ESCROW CONTRACT. ONCE BOTH SIDES HAVE CONFIRMED THEIR SATISFACTION, THE TOKENS ARE SWIFTLY AND SECURELY SWAPPED, PROVIDING AN UNCOMPLICATED AND SPEEDY RESOLUTION.</p>
        </div>
        <div className='oneway'>
          <h3>2. ONE-WAY ESCROW (UPCOMING)</h3>
          <p>PERFECT FOR SITUATIONS THAT DEMAND A BIT MORE COMPLEXITY AND PRECISION, OUR ONE-WAY ESCROW SERVICE HOLDS THE BUYER'S ETHEREUM-BASED TOKENS WITHIN A SECURE CONTRACT UNTIL THE SELLER DELIVERS THE DIGITAL PRODUCT. ONCE THE BUYER RECEIVES AND APPROVES THE PRODUCT, THE HELD TOKENS ARE RELEASED INTO THE SELLER'S WALLET. THIS METHOD, THOUGH SLIGHTLY MORE TIME-CONSUMING, GUARANTEES A HEIGHTENED LEVEL OF SECURITY AND CONTROL FOR EACH PARTY INVOLVED IN THE TRANSACTION.</p>
        </div> 
    </div>
  );
}

export default HomePage;
