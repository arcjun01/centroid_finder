import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PATHS ---
const videosPath = path.resolve(__dirname, "../sampleInput");
const publicPath = path.resolve(__dirname, "public");

console.log("Does public exist?", fs.existsSync(publicPath));
console.log("Does videos exist?", fs.existsSync(videosPath));
console.log("Files in public:", fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : "No public folder");
console.log("Files in videos:", fs.existsSync(videosPath) ? fs.readdirSync(videosPath) : "No videos folder");

// --- LOG PATHS ---
console.log("VIDEOS_DIR:", videosPath);
console.log("PUBLIC_DIR:", publicPath);

// --- VERIFY FOLDERS ---
if (fs.existsSync(videosPath)) {
  console.log("VIDEOS_DIR exists. Files:", fs.readdirSync(videosPath));
} else {
  console.log("VIDEOS_DIR does NOT exist");
}

// --- MIDDLEWARE ---
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// --- STATIC FILE SERVING ---
app.use("/videos", express.static(videosPath));      // for video files
app.use(express.static(publicPath));                // for HTML files

// --- FALLBACK ROUTE ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "test.html")); // serve HTML explicitly
});

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
