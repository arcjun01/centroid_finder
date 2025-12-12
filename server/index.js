import fs from "fs";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { validatePathEnv } from "./utils/validateEnv.js";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

let videosDir, thumbnailsDir, resultsDir;

try {
  videosDir = validatePathEnv("VIDEOS_DIR");
  thumbnailsDir = validatePathEnv("THUMBNAILS_DIR");
  resultsDir = validatePathEnv("RESULTS_DIR");
} catch (err) {
  console.error("Environment validation failed:", err.message);
  process.exit(1);
}

// shows on the terminal
console.log("Serving videos from:", videosDir);
console.log("Serving thumbnails from:", thumbnailsDir);
console.log("Serving results from:", resultsDir);

app.use("/videos", express.static(videosDir));
app.use("/thumbnails", express.static(thumbnailsDir));
app.use("/results", express.static(resultsDir));

// root rout
app.get("/", (req, res) => {
  res.send("Welcome to the Salamander API");
});

app.use("/jobs", jobsRouter);
app.use("/process", videosRouter);

// CSV download
app.get("/process/:jobId/result", (req, res) => {
  const jobId = req.params.jobId;
  const filePath = path.resolve(resultsDir, `${jobId}.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "CSV file not found" });
  }

  res.download(filePath, `${jobId}.csv`);
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running: http://localhost:${PORT}`)
  );
}

export { app };
