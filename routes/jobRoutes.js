const express = require("express");
const { submitJob, getJobStatus } = require("../controllers/jobController");
const router = express.Router();

router.post("/submit", submitJob); 
router.get("/status", getJobStatus); 

module.exports = router;
