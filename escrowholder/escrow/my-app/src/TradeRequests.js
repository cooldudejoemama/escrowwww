import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './TradeRequests.css';
import { useHistory } from 'react-router-dom';

let socket;

const TradeRequests = ({ receiverAddress }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.on('connect_error', (error) => {
      console.log('Connection Error:', error);
    });

    socket.on('connect_timeout', () => {
      console.log('Connection Timeout');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', () => {
      console.log('Reconnect Attempt');
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log('Reconnecting Attempt Number:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.log('Reconnection Error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.log('Reconnection Failed');
    });

    const getTradeRequests = async () => {
      try {
        console.log('Fetching trade requests...');
        const res = await axios.get(`http://localhost:5000/trade-requests/${receiverAddress}`);
        console.log('Received trade requests:', JSON.stringify(res.data, null, 2));
        
        if (Array.isArray(res.data.tradeRequests)) {
          const pendingTradeRequests = res.data.tradeRequests.filter(tradeRequest => tradeRequest.status === 'pending');
          setRequests(pendingTradeRequests);
          setIsLoading(false);
        } else {
          console.log('Error: trade requests data is not an array:', res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
  
    console.log('Is socket connected:', socket.connected);
  
    if (socket.connected) {
      console.log('Registering wallet address:', receiverAddress);
      socket.emit('register', receiverAddress);
    } else {
      socket.on('connect', () => {
        console.log('Socket connected. Registering wallet address:', receiverAddress);
        socket.emit('register', receiverAddress);
      });
    }
  
    socket.on('newTradeRequest', (newRequest) => {
      console.log('Received new trade request:', newRequest);
      
      if (newRequest.status === 'pending') {
        setRequests((currentRequests) => {
          console.log('Current requests:', currentRequests);
          const updatedRequests = [...currentRequests, newRequest];
          console.log('Updated requests:', updatedRequests);
          return updatedRequests;
        });
      }
    });
    
  
    // Listen for tradeRequestAccepted event and navigate to the TradeInterface page
    socket.on('tradeRequestAccepted', (tradeRequest) => {
      console.log('Trade request accepted:', tradeRequest);
      
      // Navigate to the trade interface
      history.push(`/trade-interface/${tradeRequest._id}`);
    });

  
    getTradeRequests();
  
    return () => {
      console.log('Disconnecting socket...');
      socket.off('newTradeRequest');
      socket.off('tradeRequestAccepted');
      socket.off('connect');
      socket.disconnect();
    }
  }, [receiverAddress, history]); // Include history in the dependency array
  
  const acceptRequest = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/trade-requests/accept/${id}`);
      console.log(res.data);
      setRequests(requests.filter(request => request._id !== id));

      // Emit the event to server
      socket.emit('tradeAccepted', { sender: res.data.sender, receiver: res.data.receiver });

      // Navigate to the trade interface with the unique trade ID
      history.push(`/trade-interface/${id}`);
    } catch (err) {
      console.error(err);
    }
};


  const declineRequest = async (id) => {
    try {
      console.log('Declining request:', id);
      await axios.put(`http://localhost:5000/trade-requests/decline/${id}`);
      setRequests(requests.filter((request) => request._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {requests.map((request) => (
        <div className='notification' key={request._id}>
          <p className='sender'>Sender: {request.sender}</p>
          <div className='buttons'>
            <button className='btn btn12' onClick={() => acceptRequest(request._id)}>Accept</button>
            <button className='btn btn13' onClick={() => declineRequest(request._id)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradeRequests;
