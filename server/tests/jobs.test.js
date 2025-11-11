import { getJob, createJob } from '../utils/manageJob.js';
describe('Job Processing', () => {
  test('should create a new job successfully', async () => { 
    const jobId = 'test-id-1';
    const inputPath = 'salamander_clip.mp4';
    const outputCsv = 'path/to/output.csv';
    const result = createJob(jobId, inputPath, outputCsv);
    expect(result).toHaveProperty('jobId', jobId); // Check that the returned ID matches
    expect(result.status).toBe('submitted');
  });

  test('should return correct job status', async () => {
    const jobId = 'abc123';
    const job = await getJob(jobId);

    expect(['submitted', 'processing', 'completed', 'failed']).toContain(job.status); 
  });

  test('should handle invalid job ID', async () => {
    await expect(getJob(null)).rejects.toThrow('Invalid job ID');
  });
});
