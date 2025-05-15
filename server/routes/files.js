const express = require('express');
const router = express.Router();
const fs = require('fs').promises;  // Change to use promises
const path = require('path');

// Helper function to ensure room directory exists
const ensureRoomDir = async (roomId) => {
  const roomDir = path.join(__dirname, '..', 'files', roomId);
  try {
    await fs.mkdir(roomDir, { recursive: true });
    return roomDir;
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    return roomDir;
  }
};

// Get all files for a specific room
router.get('/:roomId', async (req, res) => {
  try {
    const roomDir = await ensureRoomDir(req.params.roomId);
    const files = await fs.readdir(roomDir);
    res.json({ files });
  } catch (error) {
    console.error(`Error getting files for room ${req.params.roomId}:`, error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Get specific file content from a room
router.get('/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'files', roomId, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ message: 'File not found' });
  }
});

// Create/update file in a room
router.post('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, content } = req.body;
    const roomDir = await ensureRoomDir(roomId);
    const filePath = path.join(roomDir, name);
    
    await fs.writeFile(filePath, content || '');
    res.json({ 
      success: true, 
      message: 'File saved successfully',
      content: content || ''
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save file: ' + error.message 
    });
  }
});

// Delete file from a room
router.delete('/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    console.log('Delete request received for:', { roomId, filename });

    const roomDir = await ensureRoomDir(roomId);
    const filePath = path.join(roomDir, filename);
    
    console.log('Attempting to delete file at:', filePath);

    try {
      // Use fs.access to check if file exists
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log('File deleted successfully:', filePath);
    } catch (accessError) {
      // File doesn't exist, but we still want to remove it from memory
      console.log('File not found in filesystem:', filePath);
    }

    res.json({ 
      success: true,
      message: 'File deleted successfully',
      deletedFile: filename,
      clearStorage: true
    });

  } catch (error) {
    console.error('Error in delete endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete file: ' + error.message
    });
  }
});

module.exports = router;
