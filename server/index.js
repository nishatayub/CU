const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const File = require('./models/file');
require('dotenv').config();
const fileRoutes = require('./routes/files.js');
const aiRoutes = require('./routes/ai-gemini.js'); // Gemini-only AI router
const aiChatRoutes = require('./routes/aiChat.js'); // AI chat persistence routes
const emailRoutes = require('./routes/email.js'); // Email routes

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      'https://cu-sandy.vercel.app',
      'https://cuni.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/email', emailRoutes);

const io = new Server(server, {
  cors: {
    origin: [
      'https://cu-sandy.vercel.app',
      'https://cuni.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  path: '/socket.io/',
  transports: ['polling', 'websocket'],
  pingTimeout: 30000,
  pingInterval: 10000,
  upgradeTimeout: 15000,
  allowUpgrades: true,
  cookie: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Track active rooms and their file lists
const usersInRoom = {};
const rooms = new Map();
const roomFiles = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = [];
    }

    usersInRoom[roomId].push({ socketId: socket.id, username });

    // Send existing messages and file list to the joining user
    const roomMessages = rooms.get(roomId) || [];
    socket.emit('chat-history', roomMessages);

    // Get latest file list from database and broadcast
    try {
      const files = await File.find({ roomId });
      const fileList = files.map((f) => ({
        fileName: f.fileName,
        content: f.content,
        updatedAt: f.updatedAt,
      }));

      // Store current file list in memory
      roomFiles.set(roomId, fileList);

      // Send to all clients in room
      io.to(roomId).emit('files-list-updated', { files: fileList });
    } catch (error) {
      console.error('Error getting files for room:', error);
    }

    // Notify other users that someone joined (not the user who joined)
    socket.to(roomId).emit('user-joined', { username });
    
    // Add system message to chat about user joining
    const joinMessage = {
      type: 'system',
      username: 'System',
      text: `${username} joined the room`,
      timestamp: new Date().toISOString(),
      roomId
    };
    
    // Save system message to room history
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    rooms.get(roomId).push(joinMessage);
    
    // Broadcast join message to all users in room (including the one who joined)
    io.to(roomId).emit('receive-message', joinMessage);
    
    // Update user list for all users in room
    io.to(roomId).emit('update-user-list', usersInRoom[roomId]);
  });

  socket.on('file-created', async ({ roomId, fileName, content }) => {
    try {
      // First save to MongoDB
      const file = await File.create({
        roomId,
        fileName,
        content: content || '',
      });

      // Update room's file list in memory
      const roomFileList = roomFiles.get(roomId) || [];
      roomFileList.push({
        fileName: file.fileName,
        content: file.content,
        updatedAt: file.createdAt,
      });
      roomFiles.set(roomId, roomFileList);

      // Broadcast to ALL clients in the room
      io.to(roomId).emit('file-created', {
        fileName: file.fileName,
        content: file.content,
        updatedAt: file.createdAt,
      });

      // Also send updated file list
      io.to(roomId).emit('files-list-updated', {
        files: roomFileList,
      });
    } catch (error) {
      console.error('Error creating file:', error);
      socket.emit('file-error', {
        error: 'Failed to create file',
        details: error.message,
      });
    }
  });

  socket.on('file-deleted', async ({ roomId, fileName }) => {
    try {
      // Delete from MongoDB
      await File.findOneAndDelete({ roomId, fileName });

      // Update room's file list in memory
      const roomFileList = roomFiles.get(roomId) || [];
      const updatedFileList = roomFileList.filter((f) => f.fileName !== fileName);
      roomFiles.set(roomId, updatedFileList);

      // Broadcast deletion to all clients
      io.to(roomId).emit('file-deleted', { fileName });

      // Send updated file list
      io.to(roomId).emit('files-list-updated', {
        files: updatedFileList,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      socket.emit('file-error', {
        error: 'Failed to delete file',
        details: error.message,
      });
    }
  });

  socket.on('file-content-change', ({ roomId, fileName, content }) => {
    socket.to(roomId).emit('file-content-change', {
      fileName,
      content,
      timestamp: Date.now(),
    });
  });

  socket.on('file-updated', async ({ roomId, fileName, content }) => {
    try {
      // Update file in MongoDB after debounce
      const file = await File.findOneAndUpdate(
        { roomId, fileName },
        {
          content,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      // Update room's file list in memory
      const roomFileList = roomFiles.get(roomId) || [];
      const fileIndex = roomFileList.findIndex((f) => f.fileName === fileName);
      if (fileIndex !== -1) {
        roomFileList[fileIndex] = {
          fileName: file.fileName,
          content: file.content,
          updatedAt: file.updatedAt,
        };
      }

      // Confirm save to other clients
      socket.to(roomId).emit('file-updated', {
        fileName,
        content: file.content,
        updatedAt: file.updatedAt,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      socket.emit('file-error', {
        error: 'Failed to save file',
        details: error.message,
      });
    }
  });

  // --- CHAT SOCKET EVENTS ---
  socket.on('send-message', (message) => {
    console.log('Received message from client:', message);
    const { roomId } = message;
    if (!roomId) {
      console.log('No roomId provided in message');
      return;
    }
    // Save message to room history (per room)
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    rooms.get(roomId).push(message);
    console.log('Broadcasting message to room:', roomId);
    // Broadcast to all users in the room (including sender)
    io.to(roomId).emit('receive-message', message);
    // Send notification to all users in the room except sender
    socket.to(roomId).emit('chat-notification', {
      roomId,
      username: message.username,
      text: message.text,
      timestamp: message.timestamp,
    });
  });

  socket.on('get-chat-history', ({ roomId }) => {
    console.log('Client requesting chat history for room:', roomId);
    if (!roomId) return;
    const history = rooms.get(roomId) || [];
    console.log('Sending chat history:', history.length, 'messages');
    socket.emit('chat-history', history);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.roomId && usersInRoom[socket.roomId]) {
      const leavingUser = usersInRoom[socket.roomId].find(user => user.socketId === socket.id);
      
      usersInRoom[socket.roomId] = usersInRoom[socket.roomId].filter(
        (user) => user.socketId !== socket.id
      );
      
      if (usersInRoom[socket.roomId].length === 0) {
        delete usersInRoom[socket.roomId];
      } else {
        // Notify remaining users that someone left
        if (leavingUser) {
          socket.to(socket.roomId).emit('user-left', { username: leavingUser.username });
          
          // Add system message to chat about user leaving
          const leaveMessage = {
            type: 'system',
            username: 'System',
            text: `${leavingUser.username} left the room`,
            timestamp: new Date().toISOString(),
            roomId: socket.roomId
          };
          
          // Save system message to room history
          if (!rooms.has(socket.roomId)) {
            rooms.set(socket.roomId, []);
          }
          rooms.get(socket.roomId).push(leaveMessage);
          
          // Broadcast leave message to remaining users
          socket.to(socket.roomId).emit('receive-message', leaveMessage);
        }
        
        // Update user list for remaining users
        io.to(socket.roomId).emit('update-user-list', usersInRoom[socket.roomId]);
      }
    }
  });
});

app.post('/api/execute', async (req, res) => {
  try {
    const { language, code } = req.body;

    const languageMap = {
      js: 'javascript',
      py: 'python3',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      ts: 'typescript',
      go: 'go',
      rb: 'ruby',
      php: 'php',
      rs: 'rust',
      kt: 'kotlin',
      swift: 'swift',
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: languageMap[language] || language,
        version: '*',
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.run) {
      res.json({
        success: true,
        output: data.run.output || data.run.stderr,
      });
    } else {
      throw new Error('Execution failed');
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      output: 'Error executing code',
    });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
