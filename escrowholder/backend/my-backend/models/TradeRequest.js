const mongoose = require('mongoose');

const TradeRequestSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Sender's wallet address
  receiver: { type: String, required: true }, // Receiver's wallet address
  accepted: { type: Boolean, default: false }, // Whether the request is accepted or not
  declined: { type: Boolean, default: false }, // Whether the request is declined or not
  status: { type: String, default: "pending" } // Add a status field
});

module.exports = mongoose.model('TradeRequest', TradeRequestSchema);
