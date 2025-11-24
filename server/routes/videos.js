import express from "express";
import { v4 as uuidv4 } from "uuid";
import { runProcessor } from "../utils/processor.js";
import { createJob } from "../utils/manageJob.js";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/start", (req, res) => {
  const { inputPath, targetColor, threshold } = req.body;

  if (!inputPath || !targetColor || !threshold) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const jobId = uuidv4();
    // Ensure RESULTS_DIR exists
    const outputDir = process.env.RESULTS_DIR || path.join(process.cwd(), "results");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputCsv = path.join(outputDir, `${jobId}.csv`);

    // Create job
    createJob(jobId, inputPath, outputCsv);

    // Start processor asynchronously
    runProcessor(inputPath, outputCsv, targetColor, threshold);

    // Send JSON response
    return res.status(202).json({ message: "Job started", jobId });
  } catch (err) {
    console.error("Error starting job:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
