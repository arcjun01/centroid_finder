import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to your videos folder
const videosPath = path.resolve(__dirname, "../sampleInput");

console.log("Videos folder exists?", fs.existsSync(videosPath));

// List all files in the folder
const files = fs.readdirSync(videosPath);
console.log("Files found:", files);
