const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: false
  }
  // Add any other fields you need for your users.
});

module.exports = mongoose.model('User', UserSchema);
