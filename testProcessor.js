// testProcessor.js
import { runProcessor } from "./server/utils/processor.js";

const pid = runProcessor(
  "./sample/video.mp4",
  "./results/output.csv",
  "red",
  "50"
);

console.log("PID returned:", pid);
