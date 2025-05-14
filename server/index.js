const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
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
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);

    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = [];
    }

    usersInRoom[roomId].push({ socketId: socket.id, username });

    socket.to(roomId).emit('user-joined', { username });
    io.to(roomId).emit('update-user-list', usersInRoom[roomId]);
  });

  // ✅ Add this to handle real-time code sync
  socket.on('code-change', ({ roomId, newCode }) => {
    socket.to(roomId).emit('code-change', { newCode });
  });

  socket.on('send-message', ({ roomId, username, message }) => {
    socket.to(roomId).emit('receive-message', { username, message });
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

app.post('/execute', (req, res) => {
  const { code } = req.body;

  executeCode(code, (err, output) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({ output });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
