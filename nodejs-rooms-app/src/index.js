const express = require('express');
const sequelize = require('./models/index');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const adminRoutes = require('./routes/admin');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

console.log('Initializing app...');

// Initialize Express app
const app = express();
app.use(cors({
  origin: '*',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set up Redis clients and adapter for Socket.IO
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));  // Attach Redis adapter to Socket.IO
})();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/admin', adminRoutes);

// In-memory storage for user connections (could be a database in production)
const userConnections = {};

// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle user login event
  socket.on('login', ({ username, deviceType }) => {
    if (!userConnections[username]) {
      userConnections[username] = { android: null, desktop: null };
    }

    if (deviceType === 'android') {
      if (userConnections[username].android) {
        // Disconnect the previous Android connection
        userConnections[username].android.disconnect();
        console.log(`Previous Android connection for ${username} disconnected`);
      }
      userConnections[username].android = socket;
    } else if (deviceType === 'desktop') {
      if (userConnections[username].desktop) {
        // Disconnect the previous Desktop connection
        userConnections[username].desktop.disconnect();
        console.log(`Previous Desktop connection for ${username} disconnected`);
      }
      userConnections[username].desktop = socket;
    }

    console.log(`${username} connected from ${deviceType}`);
    socket.emit('loginSuccess', { message: `Logged in as ${username} on ${deviceType}` });
  });

  // Handle volumeClick events
  socket.on('volumeClick', (data) => {
    const { roomId, event } = data;
    console.log(`Volume click in room ${roomId}: ${event}`);
    
    if (event === 'volume_up') {
      io.to(roomId).emit('volume_up');
    } else if (event === 'volume_down') {
      io.to(roomId).emit('volume_down');
    }
  });

  // Handle room joining
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Optionally, clean up the `userConnections` map for the disconnected user
    for (let username in userConnections) {
      if (userConnections[username].android === socket) {
        userConnections[username].android = null;
      } else if (userConnections[username].desktop === socket) {
        userConnections[username].desktop = null;
      }
    }
  });
});

// Start the server and sync the database
sequelize.sync().then(() => {
  server.listen(5000, () => {
    console.log('Server running on port 5000');
  });
}).catch(err => console.log(err));
