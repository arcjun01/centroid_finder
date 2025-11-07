# Video Processing Planning

## Overall Goal
The goal of this project is to extend the existing Centroid Finder so that it can process .mp4 videos and track the largest centroid frame by frame. The output will be a CSV file showing the time (in seconds) and the x, y coordinates of the largest centroid.

## Architecture Diagram
VideoProcessor
    ↓
FrameExtractor
    ↓
CentroidFinder (reused)
    ↓
CSVDataWriter

## Components

### VideoProcessor
- Handles command-line arguments (inputPath, outputCsv, targetColor, threshold).
- Coordinates the workflow between FrameExtractor, CentroidFinder, and CSVDataWriter.

### FrameExtractor
- Reads frames from the video using FFmpegFrameGrabber (JavaCV).
- Converts each frame to BufferedImage.
- Keeps track of time (in seconds).

### CentroidFinder
- Reuses existing logic to find the largest centroid in each frame.
- Returns the (x, y) coordinates of the centroid or (-1, -1) if none found.

### CSVDataWriter
- Creates and writes data to the output CSV file.
- Writes each row as: time, x, y.

## Notes
- Will reuse most centroid-finding logic from the previous project.
- Will test each class separately (e.g., CSV writing, frame extraction).

## Project Architecture Google Doc
https://docs.google.com/document/d/1AbezGm-PsojE1OIQJpomCgaGNgs9gjjkmxQHXTS3wn8/edit?tab=t.0

## Final Verification
We validated that the salamander tracker works by:

-Watching the CSV output values change as the salamander moves.
-Ensuring the centroid coordinates align with visible movement.
-Running multiple tests with different lighting conditions and threshold values.