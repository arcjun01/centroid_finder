package io.github.arcjun01.centroid_finder;

import org.bytedeco.javacv.*; 
import java.awt.image.BufferedImage;
import java.util.List;


public class VideoProcessor {
    public static void main(String[] args) {

        // Check that the correct number of arguments are provided
        if (args.length != 4) {
            System.out.println("Usage: java -jar videoprocessor.jar <videoPath> <outputCsv> <targetColorHex> <threshold>");
            return;
        }

        // This will read input arguments
        String videoPath = args[0];
        String csvOutputPath = args[1];
        int targetColor = Integer.decode(args[2]);
        int threshold = Integer.parseInt(args[3]);

        System.out.println("Video is processing...");
        System.out.println("Target color: " + String.format("0x%06X", targetColor));
        System.out.println("Threshold: " + threshold);

        // Helper objects to process each stage
        FrameExtractor videoReader = new FrameExtractor(videoPath);
        ColorDistanceFinder colorTool = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(colorTool, targetColor, threshold);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();
        ImageGroupFinder imageAnalyzer = new BinarizingImageGroupFinder(binarizer, groupFinder);
        CSVDataWriter csvWriter = new CSVDataWriter(csvOutputPath);

        try {
            // This will read video frames
            videoReader.start();
            Java2DFrameConverter converter = new Java2DFrameConverter();
            int frameCount = 0;

            Frame frame;
            while ((frame = videoReader.grabFrame()) != null) {
                // Convert video frame to an image to analyze
                BufferedImage image = converter.convert(frame);
                if (image == null) continue;

                // Get current time (seconds) for this frame
                double currentTime = videoReader.getCurrentTimestampSeconds();

                // This analyze the image to find color groups
                List<Group> colorGroups = imageAnalyzer.findConnectedGroups(image);

                // Find the largest group’s centroid (if there's any)
                int centroidX = -1;
                int centroidY = -1;

                if (!colorGroups.isEmpty()) {
                    Group largest = colorGroups.get(0);
                    centroidX = largest.centroid().x();
                    centroidY = largest.centroid().y();
                }

                // This will record the centroid data in the CSV
                csvWriter.addRecord(currentTime, centroidX, centroidY);

                // Print progress for every 30 frames
                frameCount++;
                if (frameCount % 30 == 0) {
                    System.out.printf("Processed %.2f seconds of video%n", currentTime);
                }
            }

            // Save the CSV and stop the processing
            csvWriter.save();
            videoReader.stop();

            System.out.println("Processing complete!");
            System.out.println("Results saved to: " + csvOutputPath);

        } catch (Exception e) {
            System.err.println("An error occurred while processing the video:");
            e.printStackTrace();
        }
    }
}
