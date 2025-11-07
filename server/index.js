// Express server that manages video processing jobs by calling the Java JAR
// Matches package.json scripts: "start": "node index.js", "dev": "nodemon index.js"

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());

// Config (from .env or defaults)
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, 'videos');
const RESULTS_DIR = process.env.RESULTS_DIR || path.join(__dirname, 'results');
const JAR_PATH = process.env.JAR_PATH || path.join(__dirname, 'videoProcessor.jar');
const JOBS_FILE = process.env.JOBS_FILE || path.join(RESULTS_DIR, 'jobs.json');
const PORT = process.env.PORT || 3000;

// Ensure directories exist
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

// Helpers
function resolveVideoPath(filename) {
  const safe = path.basename(filename);
  return path.join(VIDEOS_DIR, safe);
}

function loadJobs() {
  try {
    if (!fs.existsSync(JOBS_FILE)) return {};
    const raw = fs.readFileSync(JOBS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Failed to load jobs.json', err);
    return {};
  }
}

function saveJobs(jobs) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save jobs.json', err);
  }
}

// Job store
let JOBS = loadJobs();
saveJobs(JOBS);

// Serve videos and results statically
app.use('/videos', express.static(VIDEOS_DIR));
app.use('/results', express.static(RESULTS_DIR));

/**
 * GET /api/videos
 * List video files in VIDEOS_DIR
 */
app.get('/api/videos', (req, res) => {
  fs.readdir(VIDEOS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading video directory', err);
      return res.status(500).json({ error: 'Error reading video directory' });
    }
    const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const vids = files.filter(f => allowed.includes(path.extname(f).toLowerCase()));
    res.json(vids);
  });
});

/**
 * GET /thumbnail/:filename
 * Use ffmpeg to stream first frame as JPEG
 */
app.get('/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = resolveVideoPath(filename);
  if (!fs.existsSync(videoPath)) return res.status(404).json({ error: 'Video not found' });

  const ffmpegArgs = ['-i', videoPath, '-frames:v', '1', '-f', 'image2', '-vcodec', 'mjpeg', 'pipe:1'];
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  let errBuf = '';
  ffmpeg.stderr.on('data', chunk => { errBuf += chunk.toString(); });

  ffmpeg.stdout.once('readable', () => {
    res.setHeader('Content-Type', 'image/jpeg');
    ffmpeg.stdout.pipe(res);
  });

  ffmpeg.on('close', code => {
    if (code !== 0) {
      console.error('ffmpeg exited with code', code, errBuf);
      if (!res.headersSent) res.status(500).json({ error: 'Error generating thumbnail' });
    }
  });

  ffmpeg.on('error', err => {
    console.error('Failed to start ffmpeg', err);
    if (!res.headersSent) res.status(500).json({ error: 'Error generating thumbnail' });
  });
});

/**
 * POST /process/:filename?targetColor=<hex>&threshold=<int>
 * Start background Java job and return jobId
 */
app.post('/process/:filename', (req, res) => {
  const filename = req.params.filename;
  const targetColor = req.query.targetColor;
  const threshold = req.query.threshold;

  if (!targetColor || !threshold) {
    return res.status(400).json({ error: 'Missing targetColor or threshold query parameter.' });
  }

  const videoPath = resolveVideoPath(filename);
  if (!fs.existsSync(videoPath)) return res.status(404).json({ error: 'Video not found' });

  // Normalize color to 0x prefix
  let colorArg = String(targetColor);
  if (!colorArg.startsWith('0x') && !colorArg.startsWith('0X')) colorArg = '0x' + colorArg;

  const jobId = uuidv4();
  const resultCsvName = `${path.basename(filename)}.csv`;
  const resultCsvPath = path.join(RESULTS_DIR, resultCsvName);

  JOBS[jobId] = {
    id: jobId,
    filename,
    resultPath: `/results/${resultCsvName}`,
    resultAbsolutePath: resultCsvPath,
    status: 'processing',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    error: null
  };
  saveJobs(JOBS);

  const javaArgs = ['-jar', JAR_PATH, videoPath, resultCsvPath, colorArg, String(threshold)];

  try {
    const child = spawn('java', javaArgs, { detached: true, stdio: 'ignore' });
    child.unref();

    // Poll for CSV file creation/size to detect completion
    const pollIntervalMs = 2000;
    let polls = 0;
    const maxPolls = 60 * 60 * 2; // e.g., 2 hours
    const intervalId = setInterval(() => {
      polls++;
      try {
        if (fs.existsSync(resultCsvPath)) {
          const stats = fs.statSync(resultCsvPath);
          if (stats.size > 0) {
            JOBS[jobId].status = 'done';
            JOBS[jobId].finishedAt = new Date().toISOString();
            saveJobs(JOBS);
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        JOBS[jobId].status = 'error';
        JOBS[jobId].error = String(err);
        JOBS[jobId].finishedAt = new Date().toISOString();
        saveJobs(JOBS);
        clearInterval(intervalId);
      }

      if (polls > maxPolls) {
        JOBS[jobId].status = 'error';
        JOBS[jobId].error = 'Timed out waiting for result file';
        JOBS[jobId].finishedAt = new Date().toISOString();
        saveJobs(JOBS);
        clearInterval(intervalId);
      }
    }, pollIntervalMs);

    return res.status(202).json({ jobId });
  } catch (err) {
    console.error('Error starting job', err);
    JOBS[jobId].status = 'error';
    JOBS[jobId].error = String(err);
    JOBS[jobId].finishedAt = new Date().toISOString();
    saveJobs(JOBS);
    return res.status(500).json({ error: 'Error starting job' });
  }
});

/**
 * GET /process/:jobId/status
 */
app.get('/process/:jobId/status', (req, res) => {
  const jobId = req.params.jobId;
  const job = JOBS[jobId];
  if (!job) return res.status(404).json({ error: 'Job ID not found' });

  const result = { status: job.status };
  if (job.status === 'done') result.result = job.resultPath;
  else if (job.status === 'error') result.error = job.error || 'Unknown error';
  res.json(result);
});

/**
 * GET /health
 */
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Videos served at /videos from: ${VIDEOS_DIR}`);
  console.log(`Results served at /results from: ${RESULTS_DIR}`);
});
