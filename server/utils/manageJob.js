// Tracks the jobs.json file

import fs from "fs";

const jobsFile = process.env.JOBS_FILE || "./jobs.json";

function loadJobs() {
  if (!fs.existsSync(jobsFile)) return {};
  return JSON.parse(fs.readFileSync(jobsFile));
}

function saveJobs(jobs) {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
}

export function createJob(jobId, inputPath, outputCsv) {
  const jobs = loadJobs();
  jobs[jobId] = { status: "running", inputPath, outputCsv, created: new Date() };
  saveJobs(jobs);
}

export function updateJobStatus(jobId, status) {
  const jobs = loadJobs();
  if (jobs[jobId]) {
    jobs[jobId].status = status;
    saveJobs(jobs);
  }
}

export function getJobs() {
  return loadJobs();
}

export function getJob(jobId) {
  return loadJobs()[jobId] || null;
}
