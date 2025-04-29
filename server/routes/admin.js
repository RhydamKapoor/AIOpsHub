const express = require('express');
const auth = require('../middleware/auth');
const { allUsers, sendInvitation, changeRole } = require('../controllers/adminController');
const router = express.Router();

router.get("/allUsers", auth, allUsers );
router.post("/sendInvitation", auth, sendInvitation );
router.post("/changeRole", changeRole );

module.exports = router;