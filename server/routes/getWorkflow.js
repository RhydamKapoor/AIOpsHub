const express = require("express");
const router = express.Router();
const { allWorkflows } = require("../controllers/workflowController");

router.get("/allWorkflows", allWorkflows);

module.exports = router;