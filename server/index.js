import express from "express";
import dotenv from "dotenv";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";


dotenv.config();

// env variable validation
function ensureEnv(name) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

["VIDEOS_DIR", "RESULTS_DIR", "JAR_PATH", "JOBS_FILE"].forEach(ensureEnv);

const app = express();

app.use(express.json());

// Serve static video files
app.use("/videos", express.static(process.env.VIDEOS_DIR));

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

// Routes
app.use("/jobs", jobsRouter);
app.use("/process", videosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
