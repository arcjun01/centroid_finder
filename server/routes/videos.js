import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { runProcessor } from "../utils/processor.js";
import { createJob } from "../utils/manageJob.js";

const router = express.Router();

// Helper validators
function isValidHex(color) {
  return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

router.post("/start", (req, res) => {
  const { inputPath, targetColor, threshold } = req.body;

  // Validate missing params
  if (!inputPath || !targetColor || threshold === undefined) {
    return res.status(400).json({
      error: "Missing required fields: inputPath, targetColor, threshold"
    });
  }

  // Prevent malicious paths
  const videosDir = path.resolve(process.env.VIDEOS_DIR);
  const resolvedInput = path.resolve(inputPath);

  if (!resolvedInput.startsWith(videosDir)) {
    return res.status(400).json({
      error: "inputPath must be a file inside VIDEOS_DIR"
    });
  }

  // Validate hex color (#RRGGBB)
  if (!isValidHex(targetColor)) {
    return res.status(400).json({
      error: "targetColor must be a valid 6-digit hex color (e.g., #FF00AA)"
    });
  }

  // Validate numeric threshold
  if (!isNumeric(threshold)) {
    return res.status(400).json({
      error: "threshold must be a numeric value"
    });
  }

  // Create job
  const jobId = uuidv4();
  const outputCsv = `${process.env.RESULTS_DIR}/${jobId}.csv`;

  createJob(jobId, resolvedInput, outputCsv);

  const result = runProcessor(resolvedInput, outputCsv, targetColor, threshold);

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  res.status(202).json({
    message: "Job started",
    jobId,
  });
});

export default router;