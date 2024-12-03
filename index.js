const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { Queue, Worker } = require("bullmq");

const app = express();
const PORT = 3000;

const connection = { host: "localhost", port: 6379 };

const imageProcessingQueue = new Queue("imageProcessing", { connection });

const jobStatus = {};

app.use(bodyParser.json());

app.post("/api/submit", async (req, res) => {
  const { count, visits } = req.body;

  /*
    1 . Validation
    2 . Create a job ID
    3 . Enqueue tasks for each image

  */

  // Validation
  if (!count || !visits || count !== visits.length) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Create a job ID
  const jobId = uuidv4();
  jobStatus[jobId] = { status: "ongoing", errors: [] };

  // Enqueue tasks for each image
  visits.forEach((visit) => {
    visit.image_url.forEach((imageUrl) => {
      imageProcessingQueue.add("processImage", {
        jobId,
        storeId: visit.store_id,
        imageUrl,
        visitTime: visit.visit_time,
      });
    });
  });

  res.status(201).json({ job_id: jobId });
});

// Get Job Info Endpoint
app.get("/api/status", (req, res) => {
  const { jobid } = req.query;

  if (!jobid || !jobStatus[jobid]) {
    return res.status(400).json({});
  }

  res
    .status(200)
    .json({
      status: jobStatus[jobid].status,
      job_id: jobid,
      errors: jobStatus[jobid].errors,
    });
});

// Worker to Process Images
const worker = new Worker(
  "imageProcessing",
  async (job) => {
    const { jobId, storeId, imageUrl } = job.data;

    /*
        1 . Download the image
        2 . Get image dimensions
        3 . Simulate GPU processing with random delay
    */

    try {
      // Download the image
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data);

      // Get image dimensions
      const metadata = await sharp(imageBuffer).metadata();
      const perimeter = 2 * (metadata.width + metadata.height);

      // Simulate GPU processing with random delay
      const delay = Math.random() * (400 - 100) + 100; 
      await new Promise((resolve) => setTimeout(resolve, delay));

      jobStatus[jobId].status = "completed";

      console.log(`Processed Image: ${imageUrl}, Perimeter: ${perimeter}`);
    } catch (error) {
      jobStatus[jobId].status = "failed";
      jobStatus[jobId].errors.push({ store_id: storeId, error: error.message });
      throw error;
    }
  },
  { connection }
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
