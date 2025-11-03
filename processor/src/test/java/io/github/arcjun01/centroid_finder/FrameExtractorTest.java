package io.github.arcjun01.centroid_finder;

import org.bytedeco.javacv.Frame;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit-only tests for FrameExtractor.
 * 
 * These tests do not require Mockito or any external library.
 * Some tests use a fake subclass to simulate FFmpeg behavior.
 */
public class FrameExtractorTest {

    /**
     * A fake subclass that overrides FFmpeg behavior
     * to let us test FrameExtractor without real video files.
     */
    static class FakeFrameExtractor extends FrameExtractor {
        private boolean started = false;
        private boolean stopped = false;
        private int framesGrabbed = 0;
        private double fakeTimestamp = 1.234;

        public FakeFrameExtractor() {
            super("fake.mp4");
        }

        @Override
        public void start() {
            started = true;
        }

        @Override
        public Frame grabFrame() {
            if (!started || stopped) return null;
            framesGrabbed++;
            return new Frame(); // always return a new frame
        }

        @Override
        public double getCurrentTimestampSeconds() {
            return fakeTimestamp;
        }

        @Override
        public void stop() {
            stopped = true;
        }

        // helper methods for assertions
        public boolean isStarted() { return started; }
        public boolean isStopped() { return stopped; }
        public int getFramesGrabbed() { return framesGrabbed; }
    }

    @Test
    @DisplayName("start() should mark extractor as started")
    void testStart() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        assertTrue(extractor.isStarted(), "Extractor should be started after calling start()");
    }

    @Test
    @DisplayName("grabFrame() should return a frame when started")
    void testGrabFrameAfterStart() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        Frame frame = extractor.grabFrame();
        assertNotNull(frame, "Frame should not be null when started");
        assertEquals(1, extractor.getFramesGrabbed());
    }

    @Test
    @DisplayName("grabFrame() should return null if not started")
    void testGrabFrameWithoutStart() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        Frame frame = extractor.grabFrame();
        assertNull(frame, "Frame should be null if extractor was never started");
    }

    @Test
    @DisplayName("getCurrentTimestampSeconds() should return fake timestamp")
    void testTimestamp() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        double ts = extractor.getCurrentTimestampSeconds();
        assertEquals(1.234, ts, 1e-6, "Timestamp should match fake value");
    }

    @Test
    @DisplayName("stop() should mark extractor as stopped")
    void testStop() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        extractor.stop();
        assertTrue(extractor.isStopped(), "Extractor should be marked stopped");
    }

    @Test
    @DisplayName("stop() called twice should not throw")
    void testStopTwice() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        extractor.stop();
        assertDoesNotThrow(extractor::stop, "Calling stop() twice should not throw");
    }

    @Test
    @DisplayName("grabFrame() should return null after stop()")
    void testGrabAfterStop() throws Exception {
        FakeFrameExtractor extractor = new FakeFrameExtractor();
        extractor.start();
        extractor.stop();
        Frame frame = extractor.grabFrame();
        assertNull(frame, "Frame should be null after stop()");
    }

    // Optional real integration test — run only if you have an actual video file
    @Test
    @Disabled("Enable this if you have a real sample.mp4 in test resources")
    void testIntegrationRealVideo() throws Exception {
        FrameExtractor extractor = new FrameExtractor("src/test/resources/sample.mp4");
        extractor.start();
        Frame frame = extractor.grabFrame();
        assertNotNull(frame, "Frame should not be null for a real video");
        double ts = extractor.getCurrentTimestampSeconds();
        assertTrue(ts >= 0.0, "Timestamp should be non-negative");
        extractor.stop();
    }
}
