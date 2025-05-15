const express = require('express');
const router = express.Router();
const File = require('../models/file');

// Get all files in a room
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await File.find({ roomId });
    res.json({ files: files.map(f => f.fileName) });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ message: 'Error getting files' });
  }
});

// Get file content
router.get('/:roomId/:filename', async (req, res) => {
  try {
    const { roomId, filename } = req.params;
    const file = await File.findOne({ roomId, fileName: filename });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ content: file.content });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ message: 'Error getting file' });
  }
});

// Create or update file
router.post('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name: fileName, content } = req.body;
    
    const file = await File.findOneAndUpdate(
      { roomId, fileName },
      { 
        content,
        updatedAt: new Date()
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
      content: file.content
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save file: ' + error.message
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
      deletedFile: filename,
      clearStorage: true
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file: ' + error.message
    });
  }
});

module.exports = router;
