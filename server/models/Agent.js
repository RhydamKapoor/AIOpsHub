const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  // References to Tool documents
  tools: {
    type: Array,
    required: true
  },
  llm: {
    type: String,
    required: true
  },
  view: {
      nodes: {
        type: Array,
        required: true
      },
      edges: {
        type: Array,
        required: true
      },
      userQuery: {
        type: String,
        required: true
      },
      output: {
        type: String,
        required: true
      },
  },
  // For LangSmith integration
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent; 