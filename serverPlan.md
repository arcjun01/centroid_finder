##  Overall Goal
The express server will work with the Salamander API and make sure video processing runs smoothly in the background.

## Core Idea:
-We don’t want the server to freeze while videos are being processed.
-Express Server: Handles the API requests quickly. It does not process videos or do any graph logic.

-Java JAR: Does all the heavy lifting for analyzing videos.

-Filesystem: Stores job info and final results in a folder like job_data/<jobId>/.

 ## Job Submission (POST /process/{filename})
How a video job works without blocking the server:
-Server generates a unique jobId using UUID.
-Server writes the initial status (PENDING) to the job folder.
-Server uses child_process.spawn() with detached: true and .unref() to run the Java JAR in the background, passing the video path, target color, threshold, and jobId.

-Server immediately returns the jobId with a 202 Accepted status, so the client can check later.

