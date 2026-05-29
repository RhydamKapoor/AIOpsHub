const Workflow = require("../models/AllStats");
const auth = require("../middleware/auth");
const { getUserIdFromRequest } = require("../utils/resolveUserId");

exports.allWorkflows = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const role = req.user?.details?.role;
    const query = role === "Admin" ? {} : { user: userId };

    const workflows = await Workflow.find(query).sort({ createdAt: -1 });
    res.status(200).json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.allWorkflowsAuth = auth;
