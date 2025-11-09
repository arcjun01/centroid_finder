// Runs the JAR using Node's child_process

import { spawn } from "child_process";
import fs from "fs";

export function runProcessor(inputPath, outputCsv, targetColor, threshold) {
  const jarPath = process.env.JAR_PATH;

  // Create output directory if needed
  const outputDir = outputCsv.split("/").slice(0, -1).join("/");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const process = spawn("java", [
    "-jar",
    jarPath,
    inputPath,
    outputCsv,
    targetColor,
    threshold,
  ], {
    detached: true,
    stdio: "ignore",
  });

// allows it to run after Node exits
  process.unref();
  return process.pid;
}
