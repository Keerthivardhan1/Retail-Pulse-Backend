const jobs = {};

exports.saveJob = (job) => {
  jobs[job.jobId] = job;
};

exports.getJob = (jobId) => jobs[jobId];

exports.changeStatus = (jobId, status)=>{
  jobs[jobId].status = status;
}
