import 'dotenv/config';
import express from "express";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));

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

  // Full path based on .env RESULTS_DIR
  const filePath = path.resolve(process.env.RESULTS_DIR, `results_${jobId}.csv`);

  res.download(filePath, `results_${jobId}.csv`, (err) => {
    if (err) {
      console.error("CSV download error:", err);
      return res.status(404).json({ error: "CSV file not found" });
    }
  });
});


const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running: http://localhost:${PORT}`)
  );
}

export { app };
