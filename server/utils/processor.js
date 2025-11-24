import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export function runProcessor(inputPath, outputCsv, targetColor, threshold) {
  const jarPath = process.env.JAR_PATH;
  if (!jarPath) throw new Error("JAR_PATH environment variable not set");

  // Create output directory if needed
  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const child = spawn("java", [
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

  // Allows it to run after Node exits
  child.unref();
  return child.pid;
}
