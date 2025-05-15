const express = require('express');
const router = express.Router();
const File = require('../models/file');

// Get all files in a room
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await File.getByRoom(roomId);
    res.json({ 
      success: true,
      files: files.map(f => f.toFileInfo())
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get files',
      error: error.message
    });
  }
});

// Get file content
router.get('/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    const file = await File.findOne({ roomId, fileName: filename });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.json({
      success: true,
      ...file.toFileInfo()
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file',
      error: error.message
    });
  }
});

// Create or update file
router.post('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name: fileName, content } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }
    
    const file = await File.findOneAndUpdate(
      { roomId, fileName },
      { 
        content,
        $setOnInsert: { createdAt: new Date() }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      message: 'File saved successfully',
      ...file.toFileInfo()
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save file',
      error: error.message
    });
  }
});

// Delete file
router.delete('/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    const result = await File.findOneAndDelete({ roomId, fileName: filename });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      ...result.toFileInfo()
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

module.exports = router;
