import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { validatePathEnv } from "./validateEnv.js";
import { updateJobProgress, updateJobStatus } from "./manageJob.js";

export function runProcessor(inputPath, outputCsv, targetColor, threshold, jobId) {
  let jarPath;
  try {
    jarPath = validatePathEnv("JAR_PATH"); 
  } catch (err) {
    console.error("[Processor Error] Invalid JAR_PATH:", err.message);
    updateJobStatus(jobId, "failed");
    return null;
  }

  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

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

    console.log(`[Processor] Started Java process (PID: ${child.pid})`);

    // Simulate progress every 1 second
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 5;
      if (simulatedProgress >= 95) simulatedProgress = 95;
      updateJobProgress(jobId, simulatedProgress);
    }, 1000);

    // Listen for Java stdout (optional)
    child.stdout.on("data", (data) => {
      const text = data.toString().trim();
      console.log(`[Java stdout] ${text}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[Java Error] ${data.toString()}`);
    });

    child.on("close", (code) => {
      clearInterval(interval);

      updateJobProgress(jobId, 100);
      updateJobStatus(jobId, code === 0 ? "completed" : "failed");

      console.log(`[Processor] Java process exited with code ${code}`);
      console.log(`[Processor] CSV exists? ${fs.existsSync(outputCsv)}`);
    });

    return child.pid;
  } catch (err) {
    console.error("[Processor Error] Failed to spawn Java process:", err.message);
    updateJobStatus(jobId, "failed");
    return null;
  }
}
