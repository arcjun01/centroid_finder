import fs from "fs";
import path from "path";

// current working directory
const jobsFile = process.env.JOBS_FILE
  ? path.resolve(process.cwd(), process.env.JOBS_FILE)
  : null;

if (!jobsFile) {
  throw new Error("JOBS_FILE is not set. Define it in your .env.");
}

// Ensure the directory for the jobs file exists
const jobsDir = path.dirname(jobsFile);
if (!fs.existsSync(jobsDir)) {
  fs.mkdirSync(jobsDir, { recursive: true });
}

// Ensure the jobs file exists
if (!fs.existsSync(jobsFile)) {
  fs.writeFileSync(jobsFile, "{}", "utf-8");
}

// Helper to load jobs from file
function loadJobs() {
  try {
    const data = fs.readFileSync(jobsFile, "utf-8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("Error reading jobs file:", err);
    return {};
  }
}

// Helper to save jobs to file
function saveJobs(jobs) {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), "utf-8");
}

// Creates a new job and saves it to jobs.json
export function createJob(jobId, inputPath, outputCsv, targetColor, threshold) {
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
    targetColor: targetColor || null,   // <-- add this
    threshold: threshold !== undefined ? threshold : null, // <-- add this
  };

  jobs[jobId] = job;
  saveJobs(jobs);
  return job;
}


// Updates the status of a specific job
export function updateJobStatus(jobId, status) {
  const jobs = loadJobs();
  if (jobs[jobId]) {
    jobs[jobId].status = status;
    saveJobs(jobs);
  }
}

// Returns all jobs
export function getJobs() {
  return loadJobs();
}

// Gets a job by its ID
export async function getJob(jobId) {
  if (!jobId) throw new Error("Invalid job ID");

  const jobs = loadJobs();
  const job = jobs[jobId] || null;

  return job;
}
