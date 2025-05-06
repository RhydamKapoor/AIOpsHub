const Workflow = require("../models/AllStats");


exports.allWorkflows = async(req, res) => {
    try {
        const workflows = await Workflow.find({});
        res.status(200).json(workflows);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

