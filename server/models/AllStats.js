const mongoose = require('mongoose');

const tokenUsageSchema = new mongoose.Schema({
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number
  }, { _id: false });
  
  const workflowStepSchema = new mongoose.Schema({
    stepName: String,
    input: String,
    output: String,
    toolUsed: [String],
    tokenUsage: tokenUsageSchema,
    timestamp: { type: Date, default: Date.now }
  }, { _id: false });
  
  const workflowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String, // e.g., "Summarize PDF", "Agent Chat"
    steps: [workflowStepSchema],
    finalResponse: String,
    totalTokenUsage: tokenUsageSchema,
    createdAt: { type: Date, default: Date.now }
  });
  
const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);

module.exports = Workflow; 