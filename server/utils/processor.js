import { spawn } from "child_process";
import fs from "fs";
import path from "path";

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
 * Runs the Java processor
 * @param {string} inputPath - Path to input video
 * @param {string} outputCsv - Path to output CSV
 * @param {string} targetColor - Color to track
 * @param {string} threshold - Threshold value
 * @returns {number|null} pid of the spawned Java process, or null if error
 */
export function runProcessor(inputPath, outputCsv, targetColor, threshold) {
  let jarPath;

  try {
    jarPath = validateJarPath();
  } catch (err) {
    console.error("[Processor Error] Cannot start processor:", err.message);
    return null; // Graceful failure
  }

  // Create output directory if needed
  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Spawn Java process
    const child = spawn(
      "java",
      ["-jar", jarPath, inputPath, outputCsv, targetColor, threshold],
      {
        detached: true,
        stdio: "ignore", // suppress output
      }
    );

    child.unref(); // Allow Node to exit without killing the process
    console.log(`[Processor] Started Java process (PID: ${child.pid})`);
    return child.pid;
  } catch (err) {
    console.error("[Processor Error] Failed to spawn Java process:", err.message);
    return null;
  }
}

/**
 * One-off test function to validate all three scenarios:
 * 1. Missing JAR_PATH
 * 2. Invalid JAR_PATH
 * 3. Valid JAR_PATH (prints PID)
 */
export function testProcessorScenarios() {
  console.log("\n--- Test 1: Missing JAR_PATH ---");
  const originalJarPath = process.env.JAR_PATH;
  delete process.env.JAR_PATH;
  runProcessor("./sample/video.mp4", "./results/output.csv", "red", "50");

  console.log("\n--- Test 2: Invalid JAR_PATH ---");
  process.env.JAR_PATH = "./fake/path/doesnotexist.jar";
  runProcessor("./sample/video.mp4", "./results/output.csv", "red", "50");

  console.log("\n--- Test 3: Valid JAR_PATH ---");
  // Replace with the real path to your JAR
  process.env.JAR_PATH = originalJarPath || "../processor/target/centroid-finder-1.0-SNAPSHOT-jar-with-dependencies.jar";
  runProcessor("./sample/video.mp4", "./results/output.csv", "red", "50");
}
