import 'dotenv/config';

import express from "express";
import jobsRouter from "./routes/jobs.js";
import videosRouter from "./routes/videos.js";


const app = express();
app.use(express.json());

// Static videos
app.use("/videos", express.static(process.env.VIDEOS_DIR));

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.use("/jobs", jobsRouter);
app.use("/process", videosRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };
