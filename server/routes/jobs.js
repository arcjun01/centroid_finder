import express from "express";
import { getJobs, getJob } from "../utils/manageJob.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getJobs());
});

router.get("/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

export default router;