// server/utils/processor.js
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { updateJobProgress, updateJobStatus } from "./manageJob.js";

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

export function runProcessor(inputPath, outputCsv, targetColor, threshold, jobId) {
  let jarPath;
  try {
    jarPath = validateJarPath();
  } catch (err) {
    console.error("[Processor Error] Cannot start processor:", err.message);
    updateJobStatus(jobId, "failed");
    return null;
  }

  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[Processor] Will write CSV to: ${outputCsv}`);

  try {
    updateJobStatus(jobId, "processing");

    const child = spawn(
      "java",
      ["-jar", jarPath, inputPath, outputCsv, targetColor, threshold],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    // Simulate progress every 1 second
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 5; // increment 5%
      if (simulatedProgress >= 95) simulatedProgress = 95; // cap before completion
      updateJobProgress(jobId, simulatedProgress);
    }, 1000);

    // Listen for Java stdout (optional)
    child.stdout.on("data", (data) => {
      const text = data.toString();
      console.log(`[Java stdout] ${text.trim()}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[Java Error] ${data.toString()}`);
    });

    child.on("close", (code) => {
      clearInterval(interval);
      updateJobProgress(jobId, 100);
      updateJobStatus(jobId, code === 0 ? "completed" : "failed");

      const exists = fs.existsSync(outputCsv);
      console.log(`[Processor] Java process exited with code ${code}`);
      console.log("[Processor] CSV exists after completion?", exists);
    });

    console.log(`[Processor] Started Java process (PID: ${child.pid})`);
    return child.pid;
  } catch (err) {
    console.error("[Processor Error] Failed to spawn Java process:", err.message);
    updateJobStatus(jobId, "failed");
    return null;
  }
}
