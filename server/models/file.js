const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster queries
FileSchema.index({ roomId: 1, fileName: 1 }, { unique: true });

module.exports = mongoose.model('File', FileSchema);
