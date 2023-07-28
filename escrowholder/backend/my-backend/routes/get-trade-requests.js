const express = require('express');
const router = express.Router();
const TradeRequest = require('../models/TradeRequest');

router.get('/:receiver', async (req, res) => {
  const receiver = req.params.receiver;

  try {
    const tradeRequests = await TradeRequest.find({ receiver, declined: false });
    res.status(200).send({ tradeRequests });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
