package io.github.arcjun01.centroid_finder;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

/**
 * This test checks if CSVDataWriter works correctly.
 * It makes sure that the file is created and has the correct content.
 */
public class CSVDataWriterTest {

    @Test
    public void testSaveCreatesFileWithData() throws IOException {
        //temporary file to save test data
        Path tempFile = Files.createTempFile("test_output", ".csv");

        // Create CSVDataWriter that saves to the temp file
        CSVDataWriter writer = new CSVDataWriter(tempFile.toString());

        // Add data (time, x, y)
        writer.addRecord(1.5, 10, 20);
        writer.addRecord(2.0, 15, 25);
        
        writer.save();

        // Read back the file content
        String content = Files.readString(tempFile);

        // Check that the file has the header and the two data lines
        assertTrue(content.contains("timeSec,x,y"), "File should have header line");
        assertTrue(content.contains("1.50,10,20"), "File should contain first record");
        assertTrue(content.contains("2.00,15,25"), "File should contain second record");

        // Clean up (delete the temp file)
        Files.deleteIfExists(tempFile);
    }
    @Test
    public void testEmptyFileStillHasHeader() throws IOException {
        // Make a temporary file
        Path tempFile = Files.createTempFile("test_empty", ".csv");

        // Create the writer but don’t add any data
        CSVDataWriter writer = new CSVDataWriter(tempFile.toString());
        writer.save();

        // Read back the file
        String content = Files.readString(tempFile);

        // It should only have the header
        assertEquals("timeSec,x,y\n", content, "File should only have header line when no data added");

        // Delete temp file
        Files.deleteIfExists(tempFile);
    }
}
