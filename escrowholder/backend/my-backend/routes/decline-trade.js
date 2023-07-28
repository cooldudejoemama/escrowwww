// routes/decline-trade.js

const express = require('express');
const router = express.Router();
const TradeRequest = require('../models/TradeRequest');

router.put('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const tradeRequest = await TradeRequest.findById(id);

    if (tradeRequest.accepted) {
      console.log('Trade request cannot be declined as it was previously accepted.');
      return res.status(400).send({ message: 'Trade request cannot be declined.' });
    }

    tradeRequest.declined = true;
    await tradeRequest.save();

    const { socketIdsByWalletAddress, io } = req;
    console.log('Socket IDs by Wallet Address:', socketIdsByWalletAddress);

    const receiverSocketId = socketIdsByWalletAddress[tradeRequest.receiver];
    console.log('Receiver Socket ID:', receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('tradeRequestDeclined', tradeRequest);
    } else {
      console.log(`No socket ID found for receiver address: ${tradeRequest.receiver}`);
    }

    res.send(tradeRequest);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'An error occurred.' });
  }
});

module.exports = router;
