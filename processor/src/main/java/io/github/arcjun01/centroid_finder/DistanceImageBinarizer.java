package io.github.arcjun01.centroid_finder;
import java.awt.image.BufferedImage;

/**
 * An implementation of the ImageBinarizer interface that uses color distance
 * to determine whether each pixel should be black or white in the binary image.
 * 
 * The binarization is based on the Euclidean distance between a pixel's color and a reference target color.
 * If the distance is less than the threshold, the pixel is considered white (1);
 * otherwise, it is considered black (0).
 * 
 * The color distance is computed using a provided ColorDistanceFinder, which defines how to compare two colors numerically.
 * The targetColor is represented as a 24-bit RGB integer in the form 0xRRGGBB.
 */
public class DistanceImageBinarizer implements ImageBinarizer {
    private final ColorDistanceFinder distanceFinder;
    private final int threshold;
    private final int targetColor;

    /**
     * Constructs a DistanceImageBinarizer using the given ColorDistanceFinder,
     * target color, and threshold.
     * 
     * The distanceFinder is used to compute the Euclidean distance between a pixel's color and the target color.
     * The targetColor is represented as a 24-bit hex RGB integer (0xRRGGBB).
     * The threshold determines the cutoff for binarization: pixels with distances less than
     * the threshold are marked white, and others are marked black.
     *
     * @param distanceFinder an object that computes the distance between two colors
     * @param targetColor the reference color as a 24-bit hex RGB integer (0xRRGGBB)
     * @param threshold the distance threshold used to decide whether a pixel is white or black
     */
    public DistanceImageBinarizer(ColorDistanceFinder distanceFinder, int targetColor, int threshold) {
        this.distanceFinder = distanceFinder;
        this.targetColor = targetColor;
        this.threshold = threshold;
    }

    /**
     * Converts the given BufferedImage into a binary 2D array using color distance and a threshold.
     * Each entry in the returned array is either 0 or 1, representing a black or white pixel.
     * A pixel is white (1) if its Euclidean distance to the target color is less than the threshold.
     *
     * @param image the input RGB BufferedImage
     * @return a 2D binary array where 1 represents white and 0 represents black
     */
     //getRGB read the color of the pixel at postion (x,y) and return as 32 bit integer
     //setRGB  writes a color into thhe pixel at position (x,y) using a 32 bit integer

    @Override
    public int[][] toBinaryArray(BufferedImage image) {
        if(image == null){
            throw new IllegalArgumentException("Image cant be null");
        }
        //check image width and height
        int width = image.getWidth();
        int height = image.getHeight();
        //create binary array holding 0 and 1
        int[][] binaryArray = new int[height][width];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                //get 32 bit 
                //get pixel color at (x,y) and remove alpha bits
                int pixelColor = image.getRGB(x, y) & 0xFFFFFF; 

                //measure color difference
                double distance = distanceFinder.distance(pixelColor, targetColor);

                //if color  is close to  target color, set to white (1), else black (0)
                if (distance < threshold) {
                    binaryArray[y][x] = 1;
                } else {
                    binaryArray[y][x] = 0; 
                }
            }
        }
        //return black and white 2d array
        return binaryArray;
    }

    /**
     * Converts a binary 2D array into a BufferedImage.
     * Each value should be 0 (black) or 1 (white).
     * Black pixels are encoded as 0x000000 and white pixels as 0xFFFFFF.
     *
     * @param image a 2D array of 0s and 1s representing the binary image
     * @return a BufferedImage where black and white pixels are represented with standard RGB hex values
     */
    @Override
    public BufferedImage toBufferedImage(int[][] image) {
        if(image == null){
            throw new IllegalArgumentException("Image cant be null");
        }

        if(image.length == 0 || image[0].length == 0){
            throw new IllegalArgumentException("Image cant be empty");
        }
        //number of rows and columns
        int height = image.length;
        int width = image[0].length;

        //blank image to draw on
        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                //set pixel color based on binary value
                if (image[y][x] == 1) {
                    bufferedImage.setRGB(x, y, 0xFFFFFF);
                } else {
                    bufferedImage.setRGB(x, y, 0x000000); 
                }
            }
        }
        return bufferedImage;
    }
}
