package io.github.arcjun01.centroid_finder;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.awt.Color;
import java.awt.image.BufferedImage;

/**
 * Tests for DistanceImageBinarizer using a Fake implementation for ColorDistanceFinder 
 * to isolate the binarization and conversion logic.
 */
public class DistanceImageBinarizerTest {

    // --- FAKE Implementation ---

    /**
     * A Fake implementation of ColorDistanceFinder to control the distance result, 
     * allowing the test to focus purely on the threshold and masking logic.
     */
    private static class FakeColorDistanceFinder implements ColorDistanceFinder {
        private final double fixedDistanceToReturn;

        public FakeColorDistanceFinder(double fixedDistanceToReturn) {
            this.fixedDistanceToReturn = fixedDistanceToReturn;
        }

        @Override
        public double distance(int colorA, int colorB) {
            // This fake always returns the pre-set distance, ignoring the actual colors.
            return fixedDistanceToReturn;
        }
    }

    // --- Test Constants and Helpers ---

    private final int REF_COLOR = 0x101010; // Target color (16, 16, 16)
    private final int THRESHOLD = 50; 
    
    // 32-bit ARGB colors for input image generation
    private final int ARGB_RED_OPAQUE = new Color(255, 0, 0, 255).getRGB();   // 0xFFFF0000
    private final int ARGB_BLUE_TRANSPARENT = new Color(0, 0, 255, 10).getRGB(); // 0x0A0000FF (Low Alpha)
    
    // 24-bit RRGGBB versions of the above (what distanceFinder expects)
    private final int RGB_RED = 0xFF0000;
    private final int RGB_BLUE = 0x0000FF;

    /** Creates a simple 2x1 image with the specified 32-bit ARGB colors. */
    private BufferedImage createTestImage(int color1, int color2) {
        BufferedImage image = new BufferedImage(2, 1, BufferedImage.TYPE_INT_ARGB);
        image.setRGB(0, 0, color1);
        image.setRGB(1, 0, color2);
        return image;
    }

    // =========================================================
    // 1. Tests for toBinaryArray(BufferedImage image)
    // =========================================================

    /** Test case where all pixels are BELOW threshold (close) -> all 1s (White). */
    @Test
    void testToBinaryArray_AllWhite() {
        // Fake returns 10.0, which is < THRESHOLD (50)
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(10.0); 
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);

        BufferedImage input = createTestImage(ARGB_RED_OPAQUE, ARGB_BLUE_TRANSPARENT);
        int[][] actual = binarizer.toBinaryArray(input);

        assertArrayEquals(new int[]{1, 1}, actual[0], "Both pixels should be white (1).");
    }

    /** Test case where all pixels are ABOVE threshold (far) -> all 0s (Black). */
    @Test
    void testToBinaryArray_AllBlack() {
        // Fake returns 60.0, which is > THRESHOLD (50)
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(60.0); 
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);

        BufferedImage input = createTestImage(ARGB_RED_OPAQUE, ARGB_BLUE_TRANSPARENT);
        int[][] actual = binarizer.toBinaryArray(input);

        assertArrayEquals(new int[]{0, 0}, actual[0], "Both pixels should be black (0).");
    }

    /** * Test the crucial logic: ensure the 32-bit ARGB input is correctly masked 
     * to 24-bit RRGGBB before calling the distance finder.
     */
    @Test
    void testToBinaryArray_ColorMaskingCheck() {
        // ARGB_BLUE_TRANSPARENT is 0x0A0000FF. The expected 24-bit color is 0x0000FF.
        
        // Setup a custom Fake that asserts the pixelColor received is correctly masked.
        ColorDistanceFinder cdf = new ColorDistanceFinder() {
            @Override
            public double distance(int pixelColor, int targetColor) {
                // ASSERTION: The pixelColor passed must match the RRGGBB value.
                assertEquals(RGB_BLUE, pixelColor, "Alpha channel must be masked off (should be 0x0000FF).");
                return 0.0; 
            }
        };
        
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);
        BufferedImage input = createTestImage(ARGB_BLUE_TRANSPARENT, ARGB_BLUE_TRANSPARENT);
        
        // Execute; the assertion happens inside the fake's distance method.
        binarizer.toBinaryArray(input); 
    }
    
    /** Test for Null input. */
    @Test
    void testToBinaryArray_NullImage() {
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(0.0);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);
        
        assertThrows(IllegalArgumentException.class, () -> binarizer.toBinaryArray(null),
                     "Should throw IllegalArgumentException for a null image.");
    }

    // =========================================================
    // 2. Tests for toBufferedImage(int[][] image)
    // =========================================================

    /** Test conversion from a mixed binary array (1, 0) to an image. */
    @Test
    void testToBufferedImage_MixedPattern() {
        // [1, 0]
        int[][] binaryArray = {{1, 0}};
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(0.0);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);
        
        BufferedImage output = binarizer.toBufferedImage(binaryArray);
        
        // The output image type (TYPE_INT_RGB) will set the alpha to fully opaque (FF)
        final int WHITE = 0xFFFFFFFF; // 1
        final int BLACK = 0xFF000000; // 0

        // Position 0, 0
        assertEquals(WHITE, output.getRGB(0, 0), "Pixel (0, 0) should be White (1).");
        // Position 1, 0
        assertEquals(BLACK, output.getRGB(1, 0), "Pixel (1, 0) should be Black (0).");
    }
    
    /** Test for Null input. */
    @Test
    void testToBufferedImage_NullImage() {
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(0.0);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);
        
        assertThrows(IllegalArgumentException.class, () -> binarizer.toBufferedImage(null),
                     "Should throw IllegalArgumentException for a null array.");
    }
    
    /** Test for Empty input. */
    @Test
    void testToBufferedImage_EmptyImage() {
        ColorDistanceFinder cdf = new FakeColorDistanceFinder(0.0);
        DistanceImageBinarizer binarizer = new DistanceImageBinarizer(cdf, REF_COLOR, THRESHOLD);
        
        assertThrows(IllegalArgumentException.class, () -> binarizer.toBufferedImage(new int[0][0]),
                     "Should throw IllegalArgumentException for an empty array.");
        assertThrows(IllegalArgumentException.class, () -> binarizer.toBufferedImage(new int[5][0]),
                     "Should throw IllegalArgumentException for a zero-width array.");
    }
}