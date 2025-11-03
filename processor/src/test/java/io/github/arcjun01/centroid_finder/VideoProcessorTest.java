package io.github.arcjun01.centroid_finder;

import org.junit.jupiter.api.Test;
import java.awt.image.BufferedImage;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class VideoProcessorTest {

    /**
     * Test Case 1:
     * Image has a single white pixel, the centroid should be (1, 1).
     */
    @Test
    void testSingleWhitePixelCentroid() {
        // Create a simple 3x3 image
        BufferedImage image = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);

        // Paint the center pixel white (0xFFFFFF)
        image.setRGB(1, 1, 0xFFFFFF);

        // Set up the core logic components
        ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, 0xFFFFFF, 10);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();
        ImageGroupFinder imageGroupFinder = new BinarizingImageGroupFinder(binarizer, groupFinder);

        // Convert image and find groups
        List<Group> groups = imageGroupFinder.findConnectedGroups(image);

        // Assert there is 1 group and its centroid is correct
        assertEquals(1, groups.size(), "There should be exactly 1 white group");
        Group group = groups.get(0);
        assertEquals(1, group.centroid().x(), "Centroid X should be 1");
        assertEquals(1, group.centroid().y(), "Centroid Y should be 1");
    }

    /**
     * All black image, should find no white pixel groups.
     */
    @Test
    void testAllBlackImageHasNoGroups() {
        // 3x3 image, all pixels black (default 0x000000)
        BufferedImage image = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);

        // Set up the core logic components
        ColorDistanceFinder distanceFinder = new EuclideanColorDistance();
        ImageBinarizer binarizer = new DistanceImageBinarizer(distanceFinder, 0xFFFFFF, 10);
        BinaryGroupFinder groupFinder = new DfsBinaryGroupFinder();
        ImageGroupFinder imageGroupFinder = new BinarizingImageGroupFinder(binarizer, groupFinder);

        // Convert and find groups
        List<Group> groups = imageGroupFinder.findConnectedGroups(image);

        // Assert that no white groups exist
        assertTrue(groups.isEmpty(), "There should be no white groups detected");
    }
}
