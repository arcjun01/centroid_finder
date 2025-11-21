import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export function runProcessor(inputPath, outputCsv, targetColor, threshold) {
  const jarPath = process.env.JAR_PATH;

  // Validate JAR_PATH
  if (!jarPath) {
    return { error: "JAR_PATH is not set in environment variables." };
  }
  if (!fs.existsSync(jarPath)) {
    return { error: `JAR not found at: ${jarPath}` };
  }

  // Create output directory safely
  const outputDir = path.dirname(outputCsv);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Run Java process
  const child = spawn(
    "java",
    ["-jar", jarPath, inputPath, outputCsv, targetColor, threshold],
    {
      detached: true,
      stdio: "ignore",
    }
  );

  child.unref();
  return { pid: child.pid };
}