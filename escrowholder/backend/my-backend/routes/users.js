const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Here, you might have routes for adding a user, updating a user, deleting a user, etc.
// As an example, here's a route to get all users.

router.get('/:wallet', async (req, res) => {
    try {
      console.log(`Getting user with wallet ${req.params.wallet}`);
      let user = await User.findOne({ wallet: req.params.wallet });
      if (user == null) {
        // user not found, let's create a new user
        console.log(`No user found with wallet ${req.params.wallet}, creating new user.`);
        user = new User({ wallet: req.params.wallet });
        await user.save();
        console.log(`Created new user: ${JSON.stringify(user)}`);
      } else {
        // if user found
        console.log(`Found user: ${JSON.stringify(user)}`);
      }
      res.json(user);
    } catch (err) {
      console.log(`Error getting or creating user: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
  
  

module.exports = router;
