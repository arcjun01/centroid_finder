package io.github.arcjun01.centroid_finder;
import static org.junit.jupiter.api.Assertions.*;

import java.awt.image.BufferedImage;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class BinarizingImageGroupFinderTest {

    private FakeBinarizer fakeBinarizer;
    private FakeGroupFinder fakeGroupFinder;
    private BinarizingImageGroupFinder finder;

    @BeforeEach
    void setup() {
        fakeBinarizer = new FakeBinarizer();
        fakeGroupFinder = new FakeGroupFinder();
        finder = new BinarizingImageGroupFinder(fakeBinarizer, fakeGroupFinder);
    }

    // Null input should throw
    @Test
    void testFindConnectedGroups_ThrowsForNullImage() {
        assertThrows(IllegalArgumentException.class,
                () -> finder.findConnectedGroups(null));
    }

    // Delegates to ImageBinarizer
    @Test
    void testFindConnectedGroups_DelegatesToBinarizer() {
        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        fakeBinarizer.binaryToReturn = new int[][] {{1, 0}, {0, 1}};
        fakeGroupFinder.groupsToReturn = List.of();

        finder.findConnectedGroups(img);

        assertSame(img, fakeBinarizer.receivedImage,
                "Image should be passed to binarizer");
    }

    // TEST 3: Passes binary array to BinaryGroupFinder
    @Test
    void testFindConnectedGroups_PassesBinaryArrayToGroupFinder() {
        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        int[][] binaryArray = {{1, 1}, {0, 0}};
        fakeBinarizer.binaryToReturn = binaryArray;
        fakeGroupFinder.groupsToReturn = List.of();

        finder.findConnectedGroups(img);

        assertSame(binaryArray, fakeGroupFinder.receivedImage,
                "Binary array should be passed to group finder");
    }

    // Returns exactly what group finder returns
    @Test
    void testFindConnectedGroups_ReturnsGroupsFromGroupFinder() {
        BufferedImage img = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        int[][] binaryArray = {{1, 0}, {0, 1}};
        fakeBinarizer.binaryToReturn = binaryArray;

        List<Group> expectedGroups = List.of(
                new Group(4, new Coordinate(1, 2))
        );
        fakeGroupFinder.groupsToReturn = expectedGroups;

        List<Group> result = finder.findConnectedGroups(img);

        assertSame(expectedGroups, result,
                "Should return the exact list from group finder");
    }

    // Full chaining test
    @Test
    void testFindConnectedGroups_FullChaining() {
        BufferedImage img = new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB);
        int[][] binaryArray = {{1, 1, 0}, {0, 1, 0}, {1, 0, 0}};
        fakeBinarizer.binaryToReturn = binaryArray;

        List<Group> expectedGroups = List.of(
                new Group(3, new Coordinate(1, 1))
        );
        fakeGroupFinder.groupsToReturn = expectedGroups;

        List<Group> result = finder.findConnectedGroups(img);

        assertSame(img, fakeBinarizer.receivedImage,
                "Image should go to binarizer");
        assertSame(binaryArray, fakeGroupFinder.receivedImage,
                "Binary array should go to group finder");
        assertSame(expectedGroups, result,
                "Should return same list as group finder");
    }

    // Fake dependencies
    private static class FakeBinarizer implements ImageBinarizer {
        BufferedImage receivedImage;
        int[][] binaryToReturn;

        @Override
        public int[][] toBinaryArray(BufferedImage image) {
            this.receivedImage = image;
            return binaryToReturn;
        }

        @Override
        public BufferedImage toBufferedImage(int[][] image) {
            throw new UnsupportedOperationException("Not needed for this test");
        }
    }

    private static class FakeGroupFinder implements BinaryGroupFinder {
        int[][] receivedImage;
        List<Group> groupsToReturn;

        @Override
        public List<Group> findConnectedGroups(int[][] image) {
            this.receivedImage = image;
            return groupsToReturn;
        }
    }
}
