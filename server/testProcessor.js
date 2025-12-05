import "dotenv/config";
import { spawn } from "child_process";
import path from "path";

const videoPath = "./public/videos/salamander.mp4";
const outputCsv = "./public/results/output.csv";
const jarPath = process.env.JAR_PATH;

// Use HEX for RED
const targetColor = "0xFF0000";  // red color in hex format
const threshold = "50";

const child = spawn(
  "java",
  ["-jar", jarPath, videoPath, outputCsv, targetColor, threshold],
  { stdio: "inherit" }
);

child.on("exit", (code) => {
  if (code === 0) {
    console.log("\n✓ Java finished!");
    console.log("CSV saved at:", path.resolve(outputCsv));
  } else {
    console.error("\n✗ Java failed with exit code:", code);
  }
});
