// server/routes/videos.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import multer from "multer";
import { runProcessor } from "../utils/processor.js";
import { createJob } from "../utils/manageJob.js";
import { extractFirstFrame, createBinarizedPreview } from "../utils/livePreview.js";

const router = express.Router();

const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR);
const THUMBNAILS_DIR = path.resolve("public/thumbnails");
const RESULTS_DIR = path.resolve(process.env.RESULTS_DIR);

// Ensure directories exist
if (!fs.existsSync(THUMBNAILS_DIR)) fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });

// Multer Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEOS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

function isValidHex(color) {
  return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

// UPLOAD VIDEO
router.post("/upload", upload.single("videoFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  return res.status(200).json({ filename: req.file.filename });
});

// LIST VIDEOS
router.get("/list", (req, res) => {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    const videos = files.filter((file) => file.match(/\.(mp4|mov|avi|mkv)$/i));
    return res.json(videos);
  } catch {
    return res.status(500).json({ error: "Cannot read video directory" });
  }
});

// SERVE THUMBNAIL
router.get("/thumbnail/:filename", async (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(VIDEOS_DIR, filename);
  const thumbPath = path.join(THUMBNAILS_DIR, `${filename}.jpg`);

  try {
    if (!fs.existsSync(thumbPath)) {
      await extractFirstFrame(videoPath, thumbPath);
    }
    return res.sendFile(thumbPath);
  } catch {
    return res.status(500).json({ error: "Thumbnail processing failed" });
  }
});

// LIVE BINARIZE PREVIEW
router.get("/binarize-preview", async (req, res) => {
  const { filename, color, threshold } = req.query;
  const framePath = path.join(THUMBNAILS_DIR, `${filename}.jpg`);

  if (!fs.existsSync(framePath)) {
    return res.status(404).json({ error: "Thumbnail missing - generate first" });
  }

  try {
    const { buffer, centroid } = await createBinarizedPreview(
      framePath,
      color,
      Number(threshold)
    );

    res.set("Content-Type", "application/json");
    return res.send({
      image: buffer.toString("base64"),
      centroid,
    });
  } catch (err) {
    return res.status(500).json({ error: "Preview processing failed" });
  }
});

// FULL PROCESSING JOB (calls Java JAR)
router.post("/start", (req, res) => {
  const { inputPath, targetColor, threshold } = req.body;

  if (!inputPath || !targetColor || threshold === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!isValidHex(targetColor)) {
    return res.status(400).json({ error: "Invalid color format" });
  }

  const resolvedInput = path.resolve(VIDEOS_DIR, inputPath);

  if (!fs.existsSync(resolvedInput)) {
    return res.status(404).json({ error: "File not found" });
  }

  const jobId = uuidv4();
  const outputCsv = path.resolve(RESULTS_DIR, `${jobId}.csv`);

  console.log(`[Videos] New job ${jobId}`);
  console.log(`[Videos] Input: ${resolvedInput}`);
  console.log(`[Videos] Output CSV: ${outputCsv}`);

  // Track job in jobs.json
  createJob(jobId, resolvedInput, outputCsv, targetColor, threshold);

  // Start Java processor
  const pid = runProcessor(resolvedInput, outputCsv, targetColor, threshold, jobId);

  if (pid === null) {
    return res.status(500).json({ error: "Failed to start processor" });
  }

  // Client will poll /jobs/:jobId for status + progress
  return res.status(202).json({ jobId });
});

router.get("/result/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const csvPath = path.resolve(RESULTS_DIR, `${jobId}.csv`);

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: "CSV not found" });
  }

  return res.sendFile(csvPath);
});

export default router;
