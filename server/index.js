const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const File = require('./models/file');
require('dotenv').config();
const fileRoutes = require('./routes/files.js');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI ;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ['https://cu-sandy.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/files', fileRoutes);

const io = new Server(server, {
  cors: {
    origin: ['https://cu-sandy.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling']
});

const usersInRoom = {};
const rooms = new Map(); // Add this at the top with other constants

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username; // Store username in socket
    socket.roomId = roomId;    // Store roomId in socket

    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = [];
    }

    usersInRoom[roomId].push({ socketId: socket.id, username });

    // Send existing messages to the joining user
    const roomMessages = rooms.get(roomId) || [];
    socket.emit('chat-history', roomMessages);

    socket.to(roomId).emit('user-joined', { username });
    io.to(roomId).emit('update-user-list', usersInRoom[roomId]);
  });

  // ✅ Add this to handle real-time code sync
  socket.on('code-change', ({ roomId, newCode }) => {
    socket.to(roomId).emit('code-change', { newCode });
  });

  socket.on('send-message', (messageData) => {
    const { roomId, username, text, timestamp } = messageData;
    
    // Store message in room history
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }

    const messageWithTime = {
      roomId,
      username,
      text,
      timestamp: timestamp || new Date().toISOString()
    };

    rooms.get(roomId).push(messageWithTime);

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit('receive-message', messageWithTime);
  });

  socket.on('file-deleted', ({ roomId, fileName }) => {
    console.log('Broadcasting file deletion:', { roomId, fileName });
    // Broadcast to all clients in the room except sender
    socket.to(roomId).emit('file-deleted', { fileName });
  });

  socket.on('file-created', async ({ roomId, fileName, content }) => {
    try {
      // Save to MongoDB
      const file = await File.create({
        roomId,
        fileName,
        content: content || '',
      });

      // Broadcast to ALL clients in the room INCLUDING sender
      io.to(roomId).emit('file-created', {
        fileName,
        content: file.content,
        timestamp: new Date().toISOString()
      });

      // Also send a files-list update to all clients
      const files = await File.find({ roomId });
      io.to(roomId).emit('files-list', { 
        files: files.map(f => f.fileName)
      });

      console.log('File created and broadcasted:', { roomId, fileName });
    } catch (error) {
      console.error('Error creating file:', error);
      socket.emit('file-error', { 
        error: 'Failed to create file',
        details: error.message
      });
    }
  });

  socket.on('request-files-list', async ({ roomId }) => {
    try {
      const File = require('./models/file');
      const files = await File.find({ roomId });
      socket.emit('files-list', { 
        files: files.map(f => f.fileName)
      });
    } catch (error) {
      console.error('Error getting files list:', error);
      socket.emit('files-list', { files: [] });
    }
  });

  socket.on('file-content-change', async ({ roomId, fileName, content }) => {
    try {
      // Update file in MongoDB
      const file = await File.findOneAndUpdate(
        { roomId, fileName },
        { 
          content,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      // Broadcast file content changes to all clients in the room
      io.to(roomId).emit('file-content-updated', {
        fileName,
        content: file.content,
        timestamp: new Date().toISOString()
      });

      console.log('File content updated:', { roomId, fileName });
    } catch (error) {
      console.error('Error updating file content:', error);
      socket.emit('file-error', {
        error: 'Failed to update file content',
        details: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    for (let roomId in usersInRoom) {
      usersInRoom[roomId] = usersInRoom[roomId].filter(u => u.socketId !== socket.id);
      io.to(roomId).emit('update-user-list', usersInRoom[roomId]);
      io.to(roomId).emit('user-left', socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// These routes are now handled by fileRoutes using MongoDB

//Delete endpoint is now handled by fileRoutes

// These routes are now handled by fileRoutes using MongoDB

// Add this endpoint for code execution
app.post('/api/execute', async (req, res) => {
  try {
    const { language, code } = req.body;

    const languageMap = {
      'js': 'javascript',
      'py': 'python3',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: languageMap[language] || language,
        version: '*',
        files: [{
          content: code
        }]
      })
    });

    const data = await response.json();
    
    if (data.run) {
      res.json({
        success: true,
        output: data.run.output || data.run.stderr
      });
    } else {
      throw new Error('Execution failed');
    }

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      output: 'Error executing code'
    });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
