import express from "express";
import { getJobs, getJob } from "../utils/manageJob.js";

const router = express.Router();

// Return all jobs
router.get("/", (req, res) => {
  res.json(getJobs());
});

// Return specific job by ID
router.get("/:jobId", async (req, res) => {
  const jobId = req.params.jobId;
  const jobs = getJobs();

  // Check if job exists before calling getJob
  if (!jobs[jobId]) {
    return res.status(404).json({ error: "Job not found" });
  }

  try {
    const job = await getJob(jobId);
    res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
