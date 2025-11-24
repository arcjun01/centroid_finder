# Priority Improvements

## Refactoring Code 

1. Done: Standardize job storage by using `process.env.JOBS_FILE` to remove duplicate JSON files. 
2. Selected: Creating aditional folders for organizing and removing extra files.

## Adding Tests

1. Done: Add integration tests for POST `/process/start` and GET `/jobs/:jobId` using supertest.
2. Mock `child_process.spawn` to test missing JAR behavior and argument validation.

## Improving Error Handling

1. Selected: Add input validation in `videos.js` (sanitize `inputPath`, validate `targetColor`, ensure numeric threshold).
2. Selected: Validate `process.env.JAR_PATH` before spawning and handle missing JAR gracefully.

## Writing Documentation 

1. Selected: Create API.md describing env vars (`VIDEOS_DIR`, `RESULTS_DIR`, `JAR_PATH`, `JOBS_FILE`, `PORT`).
2. Add example request for POST `/process/start` and describe where results are stored.

## Improving Performance 

1. Use concurrency limits or a job queue for Java processing tasks.
2. Consider adopting Redis + Bull for scalable background job processing.

## Hardening Security 

1. Sanitize all file paths using normalization + prefix checks.
2. Add middleware such as Helmet, rate limiting, and strict CORS configuration.

## Bug Fixes 

1. Add missing `await` in GET `/jobs/:jobId` to fix 404 logic.
2. Fix race conditions in job writing using temp-file + rename or a lightweight DB.

## Other

1. Add `/health` and `/metrics` endpoints for observability.
2. Replace `console.log` with structured logging (Winston or Pino).
