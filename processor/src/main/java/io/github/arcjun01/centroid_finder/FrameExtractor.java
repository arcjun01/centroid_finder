package io.github.arcjun01.centroid_finder;

import org.bytedeco.javacv.*;

public class FrameExtractor {
    // Stores the file path of the video to process.
    private final String videoPath;

    // Handles video decoding and frame extraction.
    private FFmpegFrameGrabber grabber;

    /**
     * Constructor:
     * Takes a video file path and prepares the FrameExtractor
     * to start reading from that file.
     */
    public FrameExtractor(String videoPath) {
        this.videoPath = videoPath;
    }

    //Sets up the FFmpegFrameGrabber and begins decoding frames.
    public void start() throws Exception {
        grabber = new FFmpegFrameGrabber(videoPath);
        grabber.start();
    }

    //Grabs the next frame (image) from the video.
    public Frame grabFrame() throws Exception {
        return grabber.grabImage();
    }

    public double getCurrentTimestampSeconds() {
        // Convert microseconds to seconds for readability
        return grabber.getTimestamp() / 1_000_000.0;
    }

    public void stop() throws Exception {
        if (grabber != null) {
            grabber.stop();
            grabber.close();
        }
    }
}
