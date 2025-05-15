const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();
const fileRoutes = require('./routes/files.js');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/api/files', fileRoutes);

const io = new Server(server, {
  cors: {
    origin: ['https://cu-sandy.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

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

  socket.on('file-created', ({ roomId, fileName, content }) => {
    const roomDir = path.join(__dirname, 'files', roomId);
    const filePath = path.join(roomDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(roomDir)) {
      fs.mkdirSync(roomDir, { recursive: true });
    }

    // Save file to disk
    fs.writeFile(filePath, content || '', (err) => {
      if (!err) {
        // Broadcast to ALL clients in the room EXCEPT sender
        socket.to(roomId).emit('file-created', {
          fileName,
          content,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  socket.on('request-files-list', ({ roomId }) => {
    const roomDir = path.join(__dirname, 'files', roomId);
    
    if (fs.existsSync(roomDir)) {
      fs.readdir(roomDir, (err, files) => {
        if (!err) {
          socket.emit('files-list', { files });
        }
      });
    }
  });

  socket.on('file-content-change', ({ roomId, fileName, content }) => {
    // Broadcast file content changes to all clients in the room except sender
    socket.to(roomId).emit('file-content-updated', {
      fileName,
      content,
      timestamp: new Date().toISOString()
    });
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

// API: Save file
app.post('/api/save', express.json(), (req, res) => {
  const { filename, content } = req.body;
  const filePath = path.join(__dirname, 'files', filename);

  fs.writeFile(filePath, content, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save file' });
    res.json({ message: 'File saved successfully' });
  });
});

// API: Get all saved files
app.get('/api/files', (req, res) => {
  const folder = path.join(__dirname, 'files');
  fs.readdir(folder, (err, files) => {
    if (err) return res.status(500).json({ message: 'Cannot read files' });
    res.json({ files });
  });
});

// API: Get single file content
app.get('/api/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'files', req.params.filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ message: 'File not found' });
    res.json({ content: data });
  });
});

// Replace the existing delete endpoint with this one
app.delete('/api/files/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    console.log('Delete request received for:', { roomId, filename });

    // Handle undefined file case
    if (filename === 'undefined' || filename === 'undefined.js' || filename === 'undefined.cpp') {
      res.json({ 
        success: true, 
        message: 'Undefined file removed from memory'
      });
      return;
    }

    const roomDir = path.join(__dirname, 'files', roomId);
    const filePath = path.join(roomDir, filename);
    
    console.log('Attempting to delete file at:', filePath);

    // Create room directory if it doesn't exist
    if (!fs.existsSync(roomDir)) {
      await fs.promises.mkdir(roomDir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log('File deleted successfully:', filePath);
    }

    res.json({ 
      success: true, 
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete endpoint:', error);
    // Still return success to allow UI to update
    res.json({ 
      success: true, 
      message: 'File removed from memory'
    });
  }
});

// Replace the existing file creation route with this updated version
app.post('/api/files', async (req, res) => {
  try {
    const { name, content, roomId } = req.body;  // Add roomId to the request body
    const roomDir = path.join(__dirname, 'files', roomId);
    
    // Create room directory if it doesn't exist
    if (!fs.existsSync(roomDir)) {
      await fs.promises.mkdir(roomDir, { recursive: true });
    }
    
    const filePath = path.join(roomDir, name);
    
    // Use promises for file operations
    await fs.promises.writeFile(filePath, content || '');
    
    // Emit to all clients in the room including sender
    if (roomId && io) {
      io.to(roomId).emit('file-created', { 
        fileName: name, 
        content: content || '',
        timestamp: new Date().toISOString()
      });
      socket.emit('file-created', {
  roomId,
  fileName,
  content: content // Assuming new file is empty; adjust as needed
});
    }

    res.json({ 
      success: true, 
      message: 'File created successfully',
      content: content || ''
    });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create file: ' + error.message
    });
  }
});

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
