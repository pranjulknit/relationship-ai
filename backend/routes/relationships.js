const express = require("express");
const router = express.Router();
const relationshipController = require("../controllers/relationshipController");

router.post("/", relationshipController.addRelationship);

module.exports = router;