# Salamander Processing API

This API powers video discovery, thumbnail generation, and asynchronous color-based salamander centroid detection.

All file paths depend on the environment variables described at the end of this document.

## Environment Variables

These values configure where the server reads/writes data and how it runs inside Docker.

| Variable     | Description |
|--------------|-------------|
| **VIDEOS_DIR** | Directory containing uploaded/given videos. The API reads video files from here. Mapped using a Docker volume or existing folder inside the container. <br>Example: `/videos` |
| **RESULTS_DIR** | Directory where output CSV files, logs, and generated results are stored. <br>Example: `/results` |
| **JOBS_FILE** | Path to the JSON file used to persist job status. The server reads/writes job objects here to avoid duplicates. <br>Example: `/results/jobs.json` |
| **JAR_PATH** | Full path to the Java processing JAR used to analyze videos. <br>Example: `/usr/src/app/processor/centroid-finder-1.0-SNAPSHOT-jar-with-dependencies.jar` |
| **PORT** | Port the Express server listens on. Defaults to 3000. You can override this when running in Docker. <br>Example: `3000` |

# API Endpoints

## List Available Videos
**GET** `/api/videos`

Returns all videos located in `VIDEOS_DIR`.

### Responses:
- **200 OK**
    ```json
    ["intro.mp4", "demo.mov"]
    ```

- **500 Internal Server Error**
    ```json
    { "error": "Error reading video directory" }
    ```

## Generate Thumbnail
**GET** `/thumbnail/{filename}`

Extracts the first frame of the video and returns it as a JPEG.

## Path Parameters
- Name: filename	
- Type: string
- Description: Name of the video file (e.g. demo.mov)

### Responses:
- **200 OK**

- Binary JPEG image
- `Content-Type: image/jpeg`

- **500 Internal Server Error**
    ```json
    { "error": "Error generating thumbnail" }
    ```

## Start Video Processing Job
### POST /process/{filename}

Query params: ?targetColor=<hex>&threshold=<int>

Starts an asynchronous processing job and returns a job ID.

## Path Parameters
Name: filename
Type: string
Description: Video file 
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000"
}

Response: 400 Bad Request
{ "error": "Missing targetColor or threshold query parameter." }

Response: 500 Internal Server Error
{ "error": "Error starting job" }

Check Processing Job Status
GET /process/{jobId}/status

Returns current status of the job stored in JOBS_FILE.

Path Parameters
Name	Type	Description
jobId	string	Job ID returned from POST /process
Response: 200 OK — processing
{
  "status": "processing"
}

Response: 200 OK — done
{
  "status": "done",
  "result": "/results/intro.mp4.csv"
}

Response: 200 OK — error
{
  "status": "error",
  "error": "Error processing video: Unexpected ffmpeg error"
}

Response: 404 Not Found
{ "error": "Job ID not found" }

Response: 500 Internal Server Error
{ "error": "Error fetching job status" }