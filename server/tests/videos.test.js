import { fetchVideos, getThumbnail, getVideoById } from '../utils/videos.js';
describe('Video Management', () => {
  test('should fetch available videos', async () => {
    const videos = await fetchVideos();
    expect(Array.isArray(videos)).toBe(true);
    expect(videos.length).toBeGreaterThan(0);
  });

  test('should get thumbnail for a specific video', async () => {
    const videoId = 1;
    const thumbnail = await getThumbnail(videoId);

    expect(thumbnail).toMatch(/.jpg|.png$/);
  });

  test('should get video details by ID', async () => {
    const video = await getVideoById(1);
    expect(video).toHaveProperty('id', 1);
    expect(video).toHaveProperty('name');
  });

  test('should handle missing video gracefully', async () => {
    await expect(getVideoById(999)).rejects.toThrow('Video not found');
  });
});