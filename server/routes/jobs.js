// server/routes/jobs.js
import express from "express";
import { getJob } from "../utils/manageJob.js"; // reads jobs.json

const router = express.Router();

// GET job status + progress
router.get("/:jobId", async(req, res) => {
  const jobId = req.params.jobId;
  const job =await getJob(jobId);

  if (!job) return res.status(404).json({ error: "Job not found" });

  return res.json({
    status: job.status,
    progress: job.progress,
    resultCsv: job.outputCsv ? `/process/result/${jobId}` : null
  });
});

export default router;
