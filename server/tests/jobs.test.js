import { getJob, createJob } from '../utils/manageJob.js';

describe('Job Processing', () => {
  const jobId = 'test-id-1';

  test('should create a new job successfully', async () => { 
    const inputPath = 'salamander_clip.mp4';
    const outputCsv = 'path/to/output.csv';
    const result = createJob(jobId, inputPath, outputCsv);
    expect(result).toHaveProperty('jobId', jobId);
    expect(result.status).toBe('submitted');
  });

  test('should return correct job status', async () => {
    const job = await getJob(jobId);
    expect(job).not.toBeNull();
    expect(['submitted', 'processing', 'completed', 'failed']).toContain(job.status); 
  });

  test('should handle invalid job ID', async () => {
    await expect(getJob(null)).rejects.toThrow('Invalid job ID');
  });
});
