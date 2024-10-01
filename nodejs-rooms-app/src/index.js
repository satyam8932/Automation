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

// Redis-based storage for user connections
const redisClient = pubClient;

// Store user connection in Redis
const setUserConnection = async (username, deviceType, socketId) => {
  const userKey = `user:${username}`;
  const userData = { [deviceType]: socketId };
  await redisClient.hSet(userKey, userData);
};

// Get user connection data from Redis
const getUserConnection = async (username) => {
  const userKey = `user:${username}`;
  return await redisClient.hGetAll(userKey);
};

// Remove user connection from Redis
const removeUserConnection = async (username, deviceType) => {
  const userKey = `user:${username}`;
  await redisClient.hDel(userKey, deviceType);
};

// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user login event
  socket.on('login', async ({ username, deviceType }) => {
    const currentConnections = await getUserConnection(username);

    // Check if there is already an active connection with the same deviceType
    if (deviceType === 'android' && currentConnections.android) {
      console.log(`Login attempt blocked: ${username} is already connected from Android`);
      socket.emit('loginError', { message: `Already connected on Android. Cannot login again.` });
      return;  // Prevent further execution
    }

    if (deviceType === 'desktop' && currentConnections.desktop) {
      console.log(`Login attempt blocked: ${username} is already connected from Desktop`);
      socket.emit('loginError', { message: `Already connected on Desktop. Cannot login again.` });
      return;  // Prevent further execution
    }

    // Store the new connection
    await setUserConnection(username, deviceType, socket.id);
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
  socket.on('disconnect', async () => {
    console.log('User disconnected');

    // Iterate through all users in Redis to find the one matching this socket.id
    const allKeys = await redisClient.keys('user:*');

    for (const userKey of allKeys) {
      const username = userKey.split(':')[1];
      const connections = await getUserConnection(username);

      if (connections.android === socket.id) {
        await removeUserConnection(username, 'android');
        console.log(`${username} Android disconnected`);
      } else if (connections.desktop === socket.id) {
        await removeUserConnection(username, 'desktop');
        console.log(`${username} Desktop disconnected`);
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
