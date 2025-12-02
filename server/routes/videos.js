import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import multer from "multer"; // 💡 NEW: Import Multer
import { runProcessor } from "../utils/processor.js";
import { createJob } from "../utils/manageJob.js";

const router = express.Router();

// Get the absolute path for the videos directory
const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR);

// 💡 NEW: Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploaded files directly into the VIDEOS_DIR
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Helpers (Unchanged)
function isValidHex(color) {
    return /^#?[0-9A-Fa-f]{6}$/.test(color);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


// 💡 NEW: POST /process/upload - Handle file upload
router.post("/upload", upload.single('videoFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No video file provided." });
    }
    // Return the simple filename so the frontend can use it in the /start call
    return res.status(200).json({ 
        message: "File uploaded successfully",
        filename: req.file.filename 
    });
});

// GET /process/list - Return list of available videos
router.get("/list", (req, res) => {
    try {
        // Read the contents of the VIDEOS_DIR
        const files = fs.readdirSync(VIDEOS_DIR);
        
        // Filter for common video extensions (adjust the extensions if needed)
        const videoFiles = files.filter(file => 
            file.match(/\.(mp4|mov|avi|wmv|mkv|MP4)$/i)
        );
        
        res.json(videoFiles);
    } catch (error) {
        console.error("Failed to read video directory:", error);
        // If the directory doesn't exist or is inaccessible
        res.status(500).json({ error: "Could not retrieve video list. Directory error." });
    }
});

// POST /process/start (Updated Path Resolution)
router.post("/start", (req, res) => {
    const { inputPath, targetColor, threshold } = req.body;

    // Missing fields
    if (!inputPath || !targetColor || threshold === undefined) {
        return res.status(400).json({
            error: "Missing required fields: inputPath, targetColor, threshold",
        });
    }

    // 💡 FIX: Resolve the input path relative to the VIDEOS_DIR
    const resolvedInput = path.resolve(VIDEOS_DIR, inputPath);

    // Ensure file is inside VIDEOS_DIR (security check)
    if (!resolvedInput.startsWith(VIDEOS_DIR)) {
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
    // parseFloat is used here to handle string input from the client body
    if (!isNumeric(threshold)) { 
        return res.status(400).json({
            error: "threshold must be a numeric value",
        });
    }

    // Create job
    const jobId = uuidv4();
    const outputCsv = `${process.env.RESULTS_DIR}/${jobId}.csv`;

    createJob(jobId, resolvedInput, outputCsv, targetColor, threshold); // Updated createJob to store parameters

    const result = runProcessor(resolvedInput, outputCsv, targetColor, threshold);

    // If runProcessor returns an error
    if (result?.error) {
        return res.status(500).json({ error: result.error });
    }

    // Success (202 Accepted)
    return res.status(202).json({
        message: "Job started successfully",
        jobId,
    });
});

export default router;