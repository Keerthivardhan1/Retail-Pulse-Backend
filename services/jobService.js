const { processImages } = require("../utils/imageProcessor");
const jobModel = require("../models/jobModel");
const { Queue, Worker } = require('bullmq');
const sharp = require('sharp');
const axios = require('axios');


// Redis Configuration for BullMQ
const connection = { host: 'localhost', port: 6379 };

// BullMQ Queue for processing jobs
const imageProcessingQueue = new Queue('imageProcessing', { connection });
 

exports.createJob = async (jobData) => {
  const { count, visits } = jobData;

  if (!count || !visits || count !== visits.length) {
    throw new Error("Invalid job data.");
  }

  const jobId = Date.now(); 
  const job = { jobId, visits, status: "ongoing" };

  jobModel.saveJob(job);

  addToQueue(visits);


  return jobId;
};

exports.fetchJobStatus = async (jobId) => {
  const job = jobModel.getJob(jobId);

  if (!job) {
    throw new Error("Job ID not found.");
  }

  return { status: job.status, job_id: job.jobId };
};


const addToQueue = (visits)=>{
  visits.forEach((visit) => {
      visit.image_url.forEach((imageUrl) => {
          imageProcessingQueue.add('processImage', {
              jobId,
              storeId: visit.store_id,
              imageUrl,
              visitTime: visit.visit_time,
          });
      });
  });
}

const worker = new Worker(
  'imageProcessing',
  async (job) => {
      const { jobId, storeId, imageUrl } = job.data;

      try {
          /*
            1 .Downloading the image
           2.  image dimensions

          */
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data);

         
          const metadata = await sharp(imageBuffer).metadata();
          const perimeter = 2 * (metadata.width + metadata.height);

          const delay = Math.random() * (400 - 100) + 100; 
          await new Promise((resolve) => setTimeout(resolve, delay));

          jobModel.changeStatus(jobId , "completed");

          console.log(`Processed Image: ${imageUrl}, Perimeter: ${perimeter}`);
      } catch (error) {
          // Record the error
          jobModel.changeStatus(jobId , "failed");
          jobStatus[jobId].errors.push({ store_id: storeId, error: error.message });
          throw error;
      }
  },
  { connection }
);