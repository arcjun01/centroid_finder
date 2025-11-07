# Server Planning

## Overall Goal
The goal of this wave is to build an Express.js server that shows an API for managing and processing videos using the existing `VideoProcessor` JAR from the project.

The server will allow users to:
1. View available videos.
2. Generate a thumbnail (first frame).
3. Start a background video processing job.
4. Check the status of a running or completed job.

The Express server will not perform any centroid or frame analysis itself—it will **call the Java JAR** to handle processing.


## Architecture Diagram
Client
  ↓ (HTTP Request)
Express Server
  ↓ (child_process spawn)
VideoProcessor.jar
  ↓
Output CSV → Results folder


## Components
### Express Server (Node.js)
* Hosts API endpoints for `/api/videos`, `/thumbnail/:filename`, `/process/:filename`, and `/process/:jobId/status`.
* Loads configuration from `.env` (e.g., `VIDEOS_DIR`, `JAR_PATH`, and `RESULTS_DIR`).
* Uses `express.static()` to serve video and result files publicly.
* Spawns a detached background process using `child_process.spawn()` to run the Java JAR.
* Generates and tracks unique `jobIds` using the `uuid` library.

### Environment Variables (.env)
* `VIDEOS_DIR` — path to directory containing uploaded videos.
* `INPUT_DIR` — path to store processed CSVs.
* `OUTPUT_PATH` — path to the compiled `VideoProcessor.jar`.

### Job Tracker
* Keeps a JSON file or in-memory map of active and completed jobs:
  * `jobId`
  * `status` ("processing", "done", "error")
  * `resultPath` (when done)
* Allows `/process/:jobId/status` to return real-time progress.

### FFmpeg / Thumbnail Generator
* Uses FFmpeg (via `fluent-ffmpeg`) to grab the first frame from the video.
* Returns it as a JPEG to the client.

### VideoProcessor (Java JAR)
* Called from Express using:

  ```js
  spawn('java', ['-jar', jarPath, inputPath, outputCsv, targetColor, threshold], { detached: true })
  ```
* Handles all the actual frame reading and centroid analysis logic.
* Outputs a CSV file in the results directory.


## Notes
* The server **does not block** while the JAR processes a video.
* All job tracking and API responses are handled asynchronously.
* Video upload will be handled manually (placed in the videos directory).
* Only path references, not actual binary video data, are passed between Node and Java.


## Final Verification
We will verify the Express server by:
* Calling `/api/videos` and confirming it lists all videos in the directory.
* Requesting `/thumbnail/:filename` and confirming a valid image is returned.
* Starting a job via `/process/:filename` and seeing a valid `jobId` response.
* Checking `/process/:jobId/status` until it returns `"done"` and a path to the resulting CSV file.
* Manually confirming the CSV output matches previous Centroid Finder results.
