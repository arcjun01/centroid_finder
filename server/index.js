import fs from "fs";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Static hosting
app.use("/videos", express.static(process.env.VIDEOS_DIR));
app.use("/thumbnails", express.static(process.env.THUMBNAILS_DIR));
app.use("/results", express.static(process.env.RESULTS_DIR));

app.get("/", (req, res) => {
  res.send("Welcome to the Salamander API");
});

app.use("/jobs", jobsRouter);
app.use("/process", videosRouter);

// CSV Download
app.get("/process/:jobId/result", (req, res) => {
  const jobId = req.params.jobId;
  const filePath = path.resolve(process.env.RESULTS_DIR, `${jobId}.csv`);

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
