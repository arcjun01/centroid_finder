import request from 'supertest';
// IMPORTANT: Adjust the path below if your main Express app is in a different location.
// Assuming your app object is exported from the index.js file, one directory up.
import { app } from '../index.js'; // <-- Changed to 'import' and adjusted path

// NOTE: Ensure this video file exists in your shared Docker volume (/videos) 
// for the tests to accurately simulate a real request.
const TEST_VIDEO_FILE = 'dummy_video.mp4'; 

const validJobPayload = {
    inputPath: TEST_VIDEO_FILE,
    targetColor: 'red',
    threshold: 50
};
const invalidJobPayload = {
    inputPath: '', 
    targetColor: 'red',
    threshold: 50
};

describe('Job Processing API Integration Tests', () => {
    let jobId = null;

    // Test 1: POST /process/start (Successful Job Submission)
    test('POST /process/start should start a new job and return a job ID (202)', async () => {
        const response = await request(app)
            .post('/process/start')
            .send(validJobPayload)
            .expect('Content-Type', /json/)
            .expect(202); 

        expect(response.body).toHaveProperty('jobId');
        expect(typeof response.body.jobId).toBe('string');
        
        jobId = response.body.jobId;
    });

    // Test 2: POST /process/start (Invalid Job Submission)
    test('POST /process/start with invalid data should return 400 Bad Request', async () => {
        await request(app)
            .post('/process/start')
            .send(invalidJobPayload)
            .expect('Content-Type', /json/)
            .expect(400); 
    });

    // Test 3: GET /jobs/:jobId (Check Status of Started Job)
    test('GET /jobs/:jobId should return the status of a pending job (200)', async () => {
        expect(jobId).not.toBeNull(); 

        const response = await request(app)
            .get(`/jobs/${jobId}`)
            .expect('Content-Type', /json/)
            .expect(200); 

        expect(response.body).toHaveProperty('jobId', jobId);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('progress');
        expect(typeof response.body.status).toBe('string');
        expect(typeof response.body.progress).toBe('number');
    });

    // Test 4: GET /jobs/:jobId (Check Status of Non-Existent Job)
    test('GET /jobs/:jobId with an invalid ID should return 404 Not Found', async () => {
        const invalidId = 'non-existent-12345';
        await request(app)
            .get(`/jobs/${invalidId}`)
            .expect('Content-Type', /json/)
            .expect(404); 
    });
});