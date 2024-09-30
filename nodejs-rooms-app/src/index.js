const express = require('express');
const sequelize = require('./models/index');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const adminRoutes = require('./routes/admin');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors({
  origin: '*',  // Allow requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
  credentials: true,  // If you're using cookies or authentication
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket setup
io.on('connection', (socket) => {
  console.log('User connected');
  
  // Handle user joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle volume click event and broadcast specific events
  socket.on('volumeClick', (data) => {
    const { roomId, event } = data;
    console.log(`Volume click in room ${roomId}:`, event);
    
    // Emit the specific event based on volume change
    if (event === 'volume_up') {
      io.to(roomId).emit('volume_up');  // Emit 'volume_up' event
    } else if (event === 'volume_down') {
      io.to(roomId).emit('volume_down');  // Emit 'volume_down' event
    }
  });

  // Handle disconnect
  socket.on('leaveRoom', () => {
    console.log('User disconnected');
  });
});

// Start the server and sync the database
sequelize.sync().then(() => {
  server.listen(5000, () => {
    console.log('Server running on port 5000');
  });
}).catch(err => console.log(err));
