// routes/trade-requests.js

const express = require('express');
const router = express.Router();
const TradeRequest = require('../models/TradeRequest');
const User = require('../models/User'); 

router.post('/', async (req, res) => {
  const { sender, receiver } = req.body;

  // Log the request body
  console.log('Received POST request to /trade-requests with body:', req.body);

  // Check if receiver exists in database
  const receiverExists = await User.exists({ wallet: receiver }); 

  if (!receiverExists) {
    console.log('Receiver is not in the database.');
    return res.status(400).json({ error: 'Receiver does not exist in the database.' });
  }

  const tradeRequest = new TradeRequest({
    sender,
    receiver
  });

  try {
    const savedTradeRequest = await tradeRequest.save();

    // Log the saved trade request
    console.log('Trade request saved successfully:', savedTradeRequest);

    // Emit newTradeRequest event with socket.io
    console.log('req.socketIdsByWalletAddress:', req.socketIdsByWalletAddress);
    const receiverSocketId = req.socketIdsByWalletAddress[receiver];
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('newTradeRequest', savedTradeRequest);
    }

    res.send(savedTradeRequest);
  } catch (err) {
    // Log the error
    console.log('Error saving trade request:', err);

    res.status(500).send(err);
  }
});

// Add this block outside of the POST route

router.get('/:tradeId/:walletAddress', async (req, res) => {
  const { tradeId, walletAddress } = req.params;

  // Log the values of tradeId and walletAddress
  console.log('tradeId:', tradeId);
  console.log('walletAddress:', walletAddress);

  try {
    const tradeRequest = await TradeRequest.findOne({
      _id: tradeId,
      $or: [
        { sender: walletAddress },
        { receiver: walletAddress }
      ]
    });

    // Log the result of the database query
    console.log('tradeRequest:', tradeRequest);

    if (!tradeRequest) {
      return res.status(404).send({ message: 'Trade request not found.' });
    }

    res.send(tradeRequest);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'An error occurred.' });
  }
});



module.exports = router;
