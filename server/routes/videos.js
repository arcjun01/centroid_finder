import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { runProcessor } from "../utils/processor.js";
import { createJob } from "../utils/manageJob.js";

const router = express.Router();

// Helpers
function isValidHex(color) {
  return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// POST /process/start
router.post("/start", (req, res) => {
  const { inputPath, targetColor, threshold } = req.body;

  // Missing fields
  if (!inputPath || !targetColor || threshold === undefined) {
    return res.status(400).json({
      error: "Missing required fields: inputPath, targetColor, threshold",
    });
  }

  // Resolve absolute paths
  const videosDir = path.resolve(process.env.VIDEOS_DIR);
  const resolvedInput = path.resolve(inputPath);

  // Ensure file is inside VIDEOS_DIR
  if (!resolvedInput.startsWith(videosDir)) {
    return res.status(400).json({
      error: "inputPath must point to a file inside VIDEOS_DIR",
    });
  }

  // Ensure file actually exists
  if (!fs.existsSync(resolvedInput)) {
    return res.status(404).json({
      error: `Input file not found: ${resolvedInput}`,
    });
  }

  // Validate color hex format
  if (!isValidHex(targetColor)) {
    return res.status(400).json({
      error: "targetColor must be a valid 6-digit hex color (e.g. #FF00AA)",
    });
  }

  // Validate numeric threshold
  if (!isNumeric(threshold)) {
    return res.status(400).json({
      error: "threshold must be a numeric value",
    });
  }

  // reate job
  const jobId = uuidv4();
  const outputCsv = `${process.env.RESULTS_DIR}/${jobId}.csv`;

  createJob(jobId, resolvedInput, outputCsv);

  const result = runProcessor(resolvedInput, outputCsv, targetColor, threshold);

  // If runProcessor returns an error
  if (result?.error) {
    return res.status(500).json({ error: result.error });
  }

  // Success
  return res.status(202).json({
    message: "Job started successfully",
    jobId,
  });
});

export default router;
