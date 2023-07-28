const express = require('express');
const router = express.Router();
const TradeRequest = require('../models/TradeRequest');

router.put('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const tradeRequest = await TradeRequest.findById(id);

    if (tradeRequest.declined) {
      console.log('Trade request cannot be accepted as it was previously declined.');
      return res.status(400).send({ message: 'Trade request cannot be accepted.' });
    }

    tradeRequest.accepted = true;
    tradeRequest.status = "completed"; // Update status to 'completed'
    await tradeRequest.save();

    // Emit the event to the receiver's and sender's socket
    if (req.socketIdsByWalletAddress) {
      const senderSocketId = req.socketIdsByWalletAddress[tradeRequest.sender];
      if (senderSocketId) {
        req.io.to(senderSocketId).emit('tradeRequestAccepted', tradeRequest);
      }
    } else {
      console.log('socketIdsByWalletAddress is undefined');
    }

    res.send({ message: 'Trade request has been accepted and marked as completed.' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'An error occurred.' });
  }
});

  

module.exports = router;
