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
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
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

// API: Delete a file
app.delete('/api/file/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'files', req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(404).json({ message: 'File not found' });
    res.json({ message: 'File deleted' });
  });
});

// Replace the existing file creation route with this:
app.post('/api/files', async (req, res) => {
  try {
    const { name, content } = req.body;
    const filePath = path.join(__dirname, 'files', name);
    
    // Use promises for file operations
    await fs.promises.writeFile(filePath, content || '');
    
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

// Add this route to handle code execution
app.post('/api/execute', async (req, res) => {
  try {
    const { language, code } = req.body;

    // Map file extensions to Piston supported languages
    const languageMap = {
      'js': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: languageMap[language] || language,
      version: '*',
      files: [
        {
          content: code
        }
      ]
    });

    res.json({
      success: true,
      output: response.data.run.output,
      error: response.data.run.stderr
    });
  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
