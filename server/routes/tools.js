const express = require('express');
const router = express.Router();
const { 
  getAllTools,
  createTool,
  getTool,
  deleteTool,
  testTool,
  createAgent,
  // getAllAgents,
  // getAgent,
  // deleteAgent,
  // runAgent
} = require('../controllers/toolController');
const auth = require('../middleware/auth');

// Tool routes
router.get('/tools', auth, getAllTools);
router.post('/tools', createTool);
router.get('/tools/:id', auth, getTool);
router.delete('/tools/:id', auth, deleteTool);
router.post('/tools/:id/test', auth, testTool);

// Agent routes
// router.get('/agents', auth, getAllAgents);
router.post('/agents', auth, createAgent);
// router.get('/agents/:id', auth, getAgent);
// router.delete('/agents/:id', auth, deleteAgent);
// router.post('/agents/:id/run', auth, runAgent);

module.exports = router; 