const express = require('express');
const mongoose = require('mongoose');
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

// Create or update file with enhanced error handling
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

    console.log(`📝 Creating/updating file: ${fileName} in room: ${roomId}`);
    console.log(`🔍 MongoDB connection state: ${mongoose.connection.readyState}`);
    
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected, state:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
        error: `MongoDB state: ${mongoose.connection.readyState}`,
        retry: true
      });
    }
    
    // Test connection with a quick ping
    try {
      await mongoose.connection.db.admin().ping();
      console.log('✅ MongoDB ping successful');
    } catch (pingError) {
      console.error('❌ MongoDB ping failed:', pingError.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection test failed',
        error: pingError.message,
        retry: true
      });
    }
    
    // Set up operation timeout
    const operationTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timeout after 25 seconds'));
      }, 25000);
    });
    
    // Perform the database operation with timeout
    const dbOperation = File.findOneAndUpdate(
      { roomId, fileName },
      { 
        content: content || '',
        $setOnInsert: { createdAt: new Date() }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        maxTimeMS: 20000 // Database-level timeout
      }
    );
    
    const file = await Promise.race([dbOperation, operationTimeout]);

    console.log(`✅ File operation successful: ${fileName}`);
    res.json({
      success: true,
      message: 'File saved successfully',
      ...file.toFileInfo()
    });
  } catch (error) {
    console.error('❌ Error saving file:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0],
      mongoState: mongoose.connection.readyState
    });
    
    let errorMessage = 'Failed to save file';
    let shouldRetry = false;
    
    if (error.message.includes('timeout') || error.name === 'MongoTimeoutError') {
      errorMessage = 'Database operation timed out. This may be due to high server load.';
      shouldRetry = true;
    } else if (error.name === 'MongoNetworkError' || error.message.includes('network')) {
      errorMessage = 'Database network error. Please check your connection.';
      shouldRetry = true;
    } else if (error.name === 'MongoServerError') {
      errorMessage = 'Database server error. Please try again.';
      shouldRetry = true;
    } else if (error.message.includes('Operation timeout')) {
      errorMessage = 'Operation timed out after 25 seconds. Please try again.';
      shouldRetry = true;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      type: error.name || 'Unknown',
      retry: shouldRetry,
      timestamp: new Date().toISOString(),
      mongoState: mongoose.connection.readyState
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
