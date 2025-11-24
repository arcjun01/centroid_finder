// utils/manageJob.js
import fs from "fs";

const jobsFile = process.env.JOBS_FILE || "./jobs.json";

function loadJobs() {
  if (!fs.existsSync(jobsFile)) return {};
  return JSON.parse(fs.readFileSync(jobsFile));
}

function saveJobs(jobs) {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
}

/**
 * Creates a new job and saves it to jobs.json
 */
export function createJob(jobId, inputPath, outputCsv) {
  if (!jobId || !inputPath || !outputCsv) {
    throw new Error("Missing parameters");
  }

  const jobs = loadJobs();

  const job = {
    jobId,
    inputPath,
    outputCsv,
    status: "submitted", 
    progress: 0,
    created: new Date().toISOString(),
  };

  jobs[jobId] = job;
  saveJobs(jobs);
  return job; 
}

/**
 * Updates the status of a specific job
 */
export function updateJobStatus(jobId, status) {
  const jobs = loadJobs();
  if (jobs[jobId]) {
    jobs[jobId].status = status;
    saveJobs(jobs);
  }
}

/**
 * Returns all jobs
 */
export function getJobs() {
  return loadJobs();
}

/**
 * Gets a job by its ID
 */
export async function getJob(jobId) {
  if (!jobId) throw new Error("Invalid job ID");

  const jobs = loadJobs();
  const job = jobs[jobId];

  if (!job) {
    // Return a placeholder job so tests pass
    //return { jobId, status: "submitted" };
    return null;
  }

  return job;
}
