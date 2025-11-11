import express from "express";
import { v4 as uuidv4 } from "uuid";
import { runProcessor } from "../utils/processor.js";
import { createJob, updateJobStatus } from "../utils/manageJob.js";

const router = express.Router();

router.post("/start", (req, res) => {
  const { inputPath, targetColor, threshold } = req.body;

  if (!inputPath || !targetColor || !threshold) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const jobId = uuidv4();
  const outputCsv = `${process.env.RESULTS_DIR}/${jobId}.csv`;

  createJob(jobId, inputPath, outputCsv);

  runProcessor(inputPath, outputCsv, targetColor, threshold);

  res.status(202).json({ message: "Job started", jobId });
});

export default router;