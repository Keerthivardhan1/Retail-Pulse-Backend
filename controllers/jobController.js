const { createJob, fetchJobStatus } = require("../services/jobService");

exports.submitJob = async (req, res) => {
  try {
    const jobId = await createJob(req.body);
    res.status(201).json({ job_id: jobId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const { jobid } = req.query;
    if (!jobid) throw new Error("Job ID is required.");
    const status = await fetchJobStatus(jobid);
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
