import express from "express";
import dotenv from "dotenv";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";


dotenv.config();
const app = express();

app.use(express.json());

// Serve static video files
app.use("/videos", express.static(process.env.VIDEOS_DIR));

// Routes
app.use("/jobs", jobsRouter);
app.use("/process", videosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
