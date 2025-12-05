import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { updateJobProgress, updateJobStatus } from "./manageJob.js";

/**
 * Validates the JAR_PATH environment variable
 * Throws a descriptive error if missing or file does not exist
 */
function validateJarPath() {
  if (!process.env.JAR_PATH) {
    throw new Error("JAR_PATH is not set in your .env file. Please define it.");
  }

  const jarFullPath = path.resolve(process.cwd(), process.env.JAR_PATH);

  if (!fs.existsSync(jarFullPath)) {
    throw new Error(`JAR_PATH does not exist at path: ${jarFullPath}`);
  }

  return jarFullPath;
}

/**
 * Runs the Java processor and tracks progress
 * @param {string} inputPath - Path to input video
 * @param {string} outputCsv - Path to output CSV
 * @param {string} targetColor - Color to track
 * @param {string|number} threshold - Threshold value
 * @param {string} jobId - Job ID for progress tracking
 * @returns {number|null} pid of the spawned Java process, or null if error
 */
export function runProcessor(inputPath, outputCsv, targetColor, threshold, jobId) {
  let jarPath;

  try {
    jarPath = validateJarPath();
  } catch (err) {
    console.error("[Processor Error] Cannot start processor:", err.message);
    updateJobStatus(jobId, "failed");
    return null; // Graceful failure
  }

  // Create output directory if needed
  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {
    updateJobStatus(jobId, "processing");

    const child = spawn(
      "java",
      ["-jar", jarPath, inputPath, outputCsv, targetColor, threshold],
      {
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    child.stdout.on("data", (data) => {
      const text = data.toString();
      const match = text.match(/Progress: (\d+)%/);
      if (match) {
        const progress = parseInt(match[1], 10);
        updateJobProgress(jobId, progress);
      }
    });

    child.stderr.on("data", (data) => {
      console.error(`[Java Error] ${data.toString()}`);
    });

    child.on("close", (code) => {
      if (code === 0) {
        updateJobProgress(jobId, 100);
        updateJobStatus(jobId, "completed");
      } else {
        updateJobStatus(jobId, "failed");
      }
    });

    console.log(`[Processor] Started Java process (PID: ${child.pid})`);
    return child.pid;
  } catch (err) {
    console.error("[Processor Error] Failed to spawn Java process:", err.message);
    updateJobStatus(jobId, "failed");
    return null;
  }
}
