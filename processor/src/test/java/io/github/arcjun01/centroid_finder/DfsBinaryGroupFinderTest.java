package io.github.arcjun01.centroid_finder;
import static org.junit.jupiter.api.Assertions.*;

import java.beans.Transient;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

/**
 * Simplified core tests for DfsBinaryGroupFinder.
 */
public class DfsBinaryGroupFinderTest {

    private final DfsBinaryGroupFinder finder = new DfsBinaryGroupFinder();

    /** One white pixel should form one group of size 1 at (1,1). */
    @Test
    void testSinglePixelGroup() {
        int[][] image = {
                {0, 0, 0},
                {0, 1, 0},
                {0, 0, 0}
        };
        List<Group> expected = List.of(new Group(1, new Coordinate(1, 1)));
        assertEquals(expected, finder.findConnectedGroups(image));
    }

    /** A 2x2 block of white pixels should be one group with centroid (0,0). */
    @Test
    void testConnectedGroup_2x2Block() {
        int[][] image = {
                {1, 1},
                {1, 1}
        };
        Coordinate centroid = new Coordinate(0, 0); 
    List<Group> expected = List.of(new Group(4, centroid)); // FIX: Use size and Coordinate object
    assertEquals(expected, finder.findConnectedGroups(image));
    }

    /** Four isolated pixels should form four separate groups sorted correctly. */
    @Test
    void testMultipleIsolatedGroups() {
        int[][] image = {
                {1, 0, 1},
                {0, 0, 0},
                {1, 0, 1}
        };
        // The expected order is (Size DESC, Y DESC, X DESC)
    List<Group> expected = Arrays.asList( 
            
            new Group(1, new Coordinate(2, 2)), 
            new Group(1, new Coordinate(0, 2)), 
            new Group(1, new Coordinate(2, 0)), 
            new Group(1, new Coordinate(0, 0))
    );
    // Since List.of() returns an immutable list, we should wrap Arrays.asList if needed
    // List<Group> expectedImmutable = Collections.unmodifiableList(expected); 

    assertEquals(expected, finder.findConnectedGroups(image));
}

    /** Diagonal pixels should NOT count as connected. */
    @Test
    void testDiagonalConnectivity() {
        int[][] image = {
                {1, 0, 0},
                {0, 0, 0},
                {0, 0, 1}
        };
        // FIX: Replaced List.of() with Arrays.asList() AND
    // Replaced Group(size, x, y) with Group(size, new Coordinate(x, y))
    List<Group> expected = Arrays.asList(
            // Group 1: size 1, centroid (x=2, y=2)
            new Group(1, new Coordinate(2, 2)), 
            // Group 2: size 1, centroid (x=0, y=0)
            new Group(1, new Coordinate(0, 0))
    );
    
    // Note: If you must use List.of() (Java 9+), simply replace Arrays.asList with List.of
    // and ensure your compiler is using Java 9 or higher.

    assertEquals(expected, finder.findConnectedGroups(image));
}
    /** Null image should throw a NullPointerException. */
    @Test
    void testNullImage() {
        assertThrows(NullPointerException.class, () -> finder.findConnectedGroups(null));
    }

    /** Non-rectangular array should throw IllegalArgumentException. */
    @Test
    void testNonRectangularArray() {
        int[][] image = {
                {1, 0, 1},
                {1, 0},
                {1, 0, 1}
        };
        assertThrows(IllegalArgumentException.class, () -> finder.findConnectedGroups(image));
    }
}