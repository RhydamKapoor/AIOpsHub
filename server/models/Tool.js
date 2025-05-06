const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['javascript', 'python']
  },
  fileName: {
    type: String,
    required: true,
  },
  env: [{
    key: String,
    value: String,
    _id: false
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tool = mongoose.model('Tool', toolSchema);

module.exports = Tool; 