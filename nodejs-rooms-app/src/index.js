const express = require('express');
const sequelize = require('./models/index');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const adminRoutes = require('./routes/admin');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
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
  console.log('A user connected');

  // Handle user joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle volume click event
  socket.on('volumeClick', (dataString) => {
    const data = JSON.parse(dataString);
    const { roomId, event } = data;
    console.log(`Volume click in room ${roomId}:`, event);
    io.to(roomId).emit('volumeEvent', event);  // Broadcast event to the room
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server and sync the database
sequelize.sync({ force: true }).then(() => {
  server.listen(5001, () => {
    console.log('Server running on port 5001');
  });
}).catch(err => console.log(err));
