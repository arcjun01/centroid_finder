# Docker Image Plan

## Overall Plan
Packaging our backend centroid-finder server into a container that can be run anything with

docker run
-p 3000:3000
-v "$VIDEO_DIRECTORY:/videos"
-v "$RESULTS_DIRECTORY:/results"
ghcr.io/<username>/salamander:latest

## Expectations for the Image
- Run Node.js(server)
- Run Java (algorithm processing)
- Utilize API routes to the outside world
- Read videos from `/vidoes`
- Write results to `/results`
- Fast at rebuilding

### Base Image Selection
We need:
- Node.js (server)
- Java Runtime (for JAR execution)

### Chosen Base Image

node:20-slim

Reasons:
- Lightweight and fast
- Debian-based (makes installing Java easy)
- Stable for production apps
- Fewer issues than Alpine with native modules

### Java Installation
Inside the Dockerfile we will install Java:

apt-get update && apt-get install -y default-jre

This gives us a working Java runtime for:

java -jar processor.jar

### Volume Directory Strategy
Inside the container:
- /videos = where the host’s video directory will be mounted
- /results = where all output CSVs go

Our Node server will use environment variables:
VIDEOS_DIR=/videos
RESULTS_DIR=/results

No video data is stored inside the image itself, volumes are used instead.

### Expose API to Host
The server runs on port 3000 inside the container.
Dockerfile will include:

EXPOSE 3000

Users map it with:

-p 3000:3000

### Testing the Dockerfile
Local testing steps:

1. Build the image
docker build -t salamander-test .

2. Run the image with volumes
docker run \
  -p 3000:3000 \
  -v "$(pwd)/processor/sampleInput:/videos" \
  -v "$(pwd)/processor/sampleOutput:/results" \
  salamander-test

3. Test with browser / Postman:

GET http://localhost:3000/videos

POST /jobs

GET /jobs/:id

### Image Size Optimization
- Use node:20-slim
- Clean apt caches
- Only copy necessary server + JAR files

### Visual Summary
+------------------------ Docker Container ------------------------+
|  Express Server (Node)       Java Processor (JAR)                |
|         |                            |                          |
|   Reads from /videos           Reads from /videos                |
|   Writes to /results           Writes to /results                |
+------------------------------------------------------------------+
             ↑                                 ↑
             |                                 |
      Host Videos Dir                    Host Results Dir