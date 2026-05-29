const express = require("express");
const router = express.Router();
const {
  allWorkflows,
  allWorkflowsAuth,
} = require("../controllers/workflowController");

router.get("/allWorkflows", allWorkflowsAuth, allWorkflows);

module.exports = router;