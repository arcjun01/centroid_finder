# Improving the server folder 

## High-Priority Bugs & Correctness
### Route logic
- Await missing in GET /jobs/:jobId
    - getJob is async but not awaited → route always returns a Promise and breaks 404 logic.
    - File: routes/jobs.js

### Variable shadowing
- In processor.js, runProcessor stores spawn result in a variable named process, which shadows global.process.
- Rename variable and verify process.env.JAR_PATH before spawning.

### Duplicate job stores and path confusion
- manageJob.js uses jobs.json, but multiple JSON files exist.
- Standardize on process.env.JOBS_FILE.
- Document default path.

## Error Handling & Robustness
### Input validation (videos.js)
Validate:
- inputPath — sanitize & ensure inside VIDEOS_DIR
- targetColor — must be hex
- threshold — numeric & in safe range
Use path.join, path.normalize, prefix checks.

## Testing Improvements
### Integration tests
- Use supertest to cover:
- POST /process/start → creates job → returns jobId.
- GET /jobs/:jobId → returns correct job states.

### Mock processor
- Mock child_process.spawn to test:
- correct args
- behavior when JAR missing
- status transitions

### Test job file handling
- Use temp JOBS_FILE per test
- Clean up automatically

### Update utilities
Make fetchVideos, getVideoById async to match real I/O and ease mocking.

## API Documentation
- Add README / API.md explaining:
- Required env vars:
- VIDEOS_DIR
- RESULTS_DIR
- JAR_PATH
- JOBS_FILE
- PORT
- Example request for POST /process/start
- Where results are stored
- Thumbnail & result serving rules
- Consider writing an OpenAPI spec.
