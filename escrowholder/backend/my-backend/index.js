const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User'); // import User model (update the path if necessary)
const usersRoute = require('./routes/users');
const tradeRequestsRoute = require('./routes/trade-requests');
const acceptTradeRoute = require('./routes/accept-trade');
const declineTradeRoute = require('./routes/decline-trade');
const getTradeRequestsRoute = require('./routes/get-trade-requests');
const contractListeners = require('./blockchain/contractListeners'); // Make sure this path is correct
const reservoir = require('./routes/reservoir');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

const PORT = process.env.PORT || 5000;

const socketIdsByWalletAddress = {};

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toString()}: ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to attach socketIdsByWalletAddress and io to req
app.use((req, res, next) => {
  req.socketIdsByWalletAddress = socketIdsByWalletAddress;
  req.io = io;
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected...')
  contractListeners.startListening(); // <--- here
})
.catch(err => console.log(err));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use('/users', usersRoute);
app.use('/trade-requests', tradeRequestsRoute);
app.use('/trade-requests/accept', acceptTradeRoute);
app.use('/trade-requests/decline', declineTradeRoute);
app.use('/trade-requests', getTradeRequestsRoute);
app.use('/api/reservoir', require('./routes/reservoir'));


// Handle a new WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', async (walletAddress) => {
    console.log('Registering wallet address:', walletAddress, 'with socket ID:', socket.id);
    socketIdsByWalletAddress[walletAddress] = socket.id;

    // Try to find the user in the database
    let user = await User.findOne({ wallet: walletAddress });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new User({ wallet: walletAddress });
    }

    // Save the user
    await user.save();
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    // Find the wallet address associated with the disconnected socket
    for (const walletAddress in socketIdsByWalletAddress) {
      if (socketIdsByWalletAddress[walletAddress] === socket.id) {
        delete socketIdsByWalletAddress[walletAddress];
        break;
      }
    }

    // Update the user in the database to remove the socket ID
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      user.socketId = null;
      await user.save();
    }
  });
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
