import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './TradeInterface.css';

const socket = io.connect('http://localhost:5000', {
  autoConnect: false,
});

const TradeInterface = ({ account }) => {
  const [showErc20, setShowErc20] = useState(false);
  const [showErc721, setShowErc721] = useState(false);
  const [showErc1155, setShowErc1155] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const history = useHistory();
  const [activeToken, setActiveToken] = useState(null);
  const { tradeId } = useParams();
  const [tradeRequest, setTradeRequest] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const COVALENT_API_KEY = 'cqt_rQbT4kKjfVMT77HMd3GWvJwQCRRk';
  const [imagesLoaded, setImagesLoaded] = useState(false);


  const toggleShowErc20 = () => {
    if (showErc20) {
      setIsClosing(true);
      setTimeout(() => {
        setShowErc20(false);
        setIsClosing(false);
      }, 500);  // wait for closing animation to finish
    } else {
      console.log("heyy")
      setAnimate(false);
      setTimeout(() => {
        setShowErc20(true);
        setAnimate(true);
      }, 10);
    }
  };
  
  const handleClick = (contract_address) => {
    if (activeToken === contract_address) {
      setActiveToken(null);
    } else {
      setActiveToken(contract_address);
    }
  };
  
  

  useEffect(() => {
    axios.get(`http://localhost:5000/trade-requests/${tradeId}/${account}`)
      .then(res => {
        console.log('Trade request:', res.data);
        setTradeRequest(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [tradeId, account]);


  useEffect(() => {
    let images = tokens.filter(token => 
      token.supports_erc && token.supports_erc.includes('erc721')
    ).map(token => token.metadata && token.metadata.image);
  
    let loadedImages = 0;
  
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {  // This line is changed
        loadedImages++;
        if (loadedImages === images.length) {
          setImagesLoaded(true);
        }
      }
    });
  }, [tokens]);
  
  
  const checkForDuplicateIds = (tokens) => {
    let ids = [];
    tokens.forEach(token => {
      if (token.nft_data) {
        token.nft_data.forEach(nft => {
          ids.push(nft.token_id);
        });
      }
    });
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.warn('Duplicate token IDs found:', duplicates);
    } else {
      console.log('No duplicate token IDs found.');
    }
  };
  




  const fetchTokens = () => {
    const COVALENT_API_URL = `https://api.covalenthq.com/v1/1/address/${account}/balances_v2/?&key=${COVALENT_API_KEY}`;
    const COVALENT_NFT_API_URL = `https://api.covalenthq.com/v1/1/address/${account}/balances_nft/?&key=${COVALENT_API_KEY}`;
  
    axios.get(COVALENT_API_URL)
      .then(res => {
        const erc20AndErc721Tokens = res.data.data.items;
  
        axios.get(COVALENT_NFT_API_URL)
          .then(nftRes => {
            const erc721Tokens = nftRes.data.data.items;
  
            // Fetch the metadata for each NFT
            Promise.all(erc721Tokens.map(token => {
              const contractAddress = token.contract_address;
              const tokenId = token.nft_data && token.nft_data[0] ? token.nft_data[0].token_id : null;
              return axios.get(`http://localhost:5000/api/reservoir/${contractAddress}/${tokenId}`)
                .then(metadataRes => {
                  // Add the fetched metadata to the token
                  token.metadata = { 'image': metadataRes.data.tokens[0].token.image };
                  return token;
                })
                .catch(err => {
                  console.error('Failed to fetch NFT metadata:', err);
                  return token;  // Return the token without metadata
                });
            }))
            .then(erc721TokensWithMetadata => {
              // Combine ERC20, ERC721 tokens and ERC721 NFTs
              const combinedTokens = [...erc20AndErc721Tokens, ...erc721TokensWithMetadata];
              
              // Log the image URLs
              combinedTokens.map(token => {
                if (token.metadata && token.metadata.image) {
                  console.log(token.metadata.image);
                }
              });
              
              // Update the state after all fetches are complete
              setTokens(combinedTokens);
            });
          });
      });
  };
  
  
  
  

  useEffect(() => {
    fetchTokens();
  
    // Remove the interval
    // const tokensInterval = setInterval(fetchTokens, 5000);
    // return () => clearInterval(tokensInterval);
  }, [account]);
  

  useEffect(() => {
    if (!loading) {
      if (tradeRequest && ![tradeRequest.sender, tradeRequest.receiver].includes(account)) {
        history.push('/');
      }
    }
  }, [tradeRequest, account, history, loading]);

  useEffect(() => {
    if (!socket.connected) {
      socket.open();
    }

    socket.on('tradeAccepted', ({ sender, receiver }) => {
      if (account === sender || account === receiver) {
        history.push(`/trade-interface/${tradeId}`);
      }
    });
    return () => {
      socket.off('tradeAccepted');
      socket.close();
    }
  }, [history, account, tradeId]);
  
  if (loading) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="trade-interface">
      <h3 className="trade-id">TRADE ID: {tradeId}</h3>
      <div className="info-container">
        <div className="box sender-info">
          <h2>Sender: </h2>
          <p>{tradeRequest.sender}</p>
        </div>
        <div className="box receiver-info">
          <h2>Receiver: </h2>
          <p>{tradeRequest.receiver}</p>
        </div>
  
        <div className="category-container">
          <button onClick={toggleShowErc20}>ERC20</button>
          <button onClick={() => setShowErc721(!showErc721)}>ERC721</button>
          <button onClick={() => setShowErc1155(!showErc1155)}>ERC1155</button>
        </div>
        
        <div className={`tokens-container ${animate ? 'animate' : ''} ${isClosing ? 'closing' : ''}`}>
          {showErc20 && tokens.filter(token => 
            (!token.supports_erc || (token.supports_erc && token.supports_erc.includes('erc20') && !token.supports_erc.includes('erc721') && !token.supports_erc.includes('erc1155'))) 
            && token.balance > 0
          ).map(token => {
            const balance = token.balance / Math.pow(10, token.contract_decimals);
            return (
              <div 
                className={`token-box ${activeToken === token.contract_address ? 'active' : ''}`} 
                onClick={() => handleClick(token.contract_address)} 
                key={token.contract_address}
              >
                <p>Name: {token.contract_name}</p>
                <p>Amount: {balance}</p>
                {token.contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && 
                <p className='etherlinkoutside'>
                  <a className='etherlink' href={`https://etherscan.io/address/${token.contract_address}`} target="_blank" rel="noreferrer">
                    {token.contract_address}
                  </a>
                </p>}
              </div>
            );              
          })}

        
{
  imagesLoaded && showErc721 && tokens.filter(token => 
    token.supports_erc && token.supports_erc.includes('erc721')
  ).map(token => {
    return (
      <div 
        className={`token-box ${activeToken === token.contract_address ? 'active' : ''}`} 
        onClick={() => handleClick(token.contract_address)} 
        key={token.contract_address}
      >
        <h2>Name: {token.contract_name}</h2>
        <p>Amount: {token.balance}</p>
        {token.nft_data && token.nft_data.map(nft => {
          if (nft.external_data == undefined) {
            return null;
          }

          console.log('NFT:', nft);
          if (token.metadata) {
            console.log('Token metadata:', token.metadata);
            if (token.metadata.image) {
              console.log('Token image:', token.metadata.image);
            }
          }

          return (
            <div key={nft.token_id}>
                {token.metadata !== undefined && token.metadata.image !== undefined &&
              <img src={token.metadata.image} alt={nft.external_data.name} onError={(e) => { console.error('Failed to load image:', e); }} />
            }
              <p>{nft.external_data.name}</p>{/* You might want to display the name of the NFT */}
              <p>{nft.external_data.description}</p>{/* You might want to display the description of the NFT */}
            </div>
          )
        })}
      </div>
    );
  })
}



        </div>
      </div>
    </div>
  );
  
  
};

export default TradeInterface;
