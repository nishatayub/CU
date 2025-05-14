const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FILES_DIR = path.join(__dirname, '../files');

// Ensure directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR);
}

// Get all files
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(FILES_DIR);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Cannot read files', error: error.message });
  }
});

// Save file
router.post('/save', (req, res) => {
  const { filename, content } = req.body;
  
  if (!filename) {
    return res.status(400).json({ message: 'Filename is required' });
  }

  try {
    const filePath = path.join(FILES_DIR, filename);
    fs.writeFileSync(filePath, content || '');
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving file', error: error.message });
  }
});

// Get single file
router.get('/:filename', (req, res) => {
  try {
    const filePath = path.join(FILES_DIR, req.params.filename);
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ message: 'File not found', error: error.message });
  }
});

// Delete file
router.delete('/:filename', (req, res) => {
  try {
    const filePath = path.join(FILES_DIR, req.params.filename);
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

module.exports = router;
