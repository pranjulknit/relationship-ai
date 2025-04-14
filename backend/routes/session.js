const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.post("/", sessionController.startSession);
router.get("/:id/summary", sessionController.getSummary);

module.exports = router;