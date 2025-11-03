package io.github.arcjun01.centroid_finder;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EuclideanColorDistanceTest {

    private final EuclideanColorDistance distanceFinder = new EuclideanColorDistance();

    @Test
    void testIdenticalColors() {
        int color = 0x3366CC;
        double result = distanceFinder.distance(color, color);
        assertEquals(0.0, result, 0.0001, "Distance between identical colors should be 0");
    }

    @Test
    void testBlackAndWhite() {
        int black = 0x000000;
        int white = 0xFFFFFF;
        double expected = Math.sqrt(
            Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2)
        );
        double result = distanceFinder.distance(black, white);
        assertEquals(expected, result, 0.0001, "Distance between black and white should be max");
    }

    @Test
    void testRedAndGreen() {
        int red = 0xFF0000;
        int green = 0x00FF00;
        double expected = Math.sqrt(
            Math.pow(255, 2) + Math.pow(255, 2)
        );
        double result = distanceFinder.distance(red, green);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testRedAndBlue() {
        int red = 0xFF0000;
        int blue = 0x0000FF;
        double expected = Math.sqrt(
            Math.pow(255, 2) + Math.pow(255, 2)
        );
        double result = distanceFinder.distance(red, blue);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testGreenAndBlue() {
        int green = 0x00FF00;
        int blue = 0x0000FF;
        double expected = Math.sqrt(
            Math.pow(255, 2) + Math.pow(255, 2)
        );
        double result = distanceFinder.distance(green, blue);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testGrayShades() {
        int darkGray = 0x333333;
        int lightGray = 0xCCCCCC;
        double expected = Math.sqrt(
            3 * Math.pow(0xCC - 0x33, 2)
        );
        double result = distanceFinder.distance(darkGray, lightGray);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testSingleChannelDifference_RedOnly() {
        int colorA = 0xFF0000;
        int colorB = 0x7F0000;
        double expected = Math.sqrt(Math.pow(255 - 127, 2));
        double result = distanceFinder.distance(colorA, colorB);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testSingleChannelDifference_BlueOnly() {
        int colorA = 0x0000FF;
        int colorB = 0x000080;
        double expected = Math.sqrt(Math.pow(255 - 128, 2));
        double result = distanceFinder.distance(colorA, colorB);
        assertEquals(expected, result, 0.0001);
    }

    @Test
    void testSymmetry() {
        int colorA = 0xABCDEF;
        int colorB = 0x123456;
        double distAB = distanceFinder.distance(colorA, colorB);
        double distBA = distanceFinder.distance(colorB, colorA);
        assertEquals(distAB, distBA, 0.0001, "Distance should be symmetric");
    }

    @Test
    void testRangeBoundaries() {
        // Valid range 0x000000 - 0xFFFFFF
        int colorMin = 0x000000;
        int colorMax = 0xFFFFFF;
        double distance = distanceFinder.distance(colorMin, colorMax);
        assertTrue(distance >= 0, "Distance should never be negative");
        assertTrue(distance <= Math.sqrt(3 * Math.pow(255, 2)), "Distance should not exceed max possible");
    }
}
