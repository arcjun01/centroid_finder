package io.github.arcjun01.centroid_finder;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
// CSVDataWriter
// This class is used to save the time and centroid coordinates into a CSV file.
// It keeps a list of rows in memory, allows adding new records, and saves all rows to a file.


public class CSVDataWriter {
   // Where we want to save the file
    private final String outputPath;
    
    //list to keeps all the lines we want to write
    private final List<String> rows = new ArrayList<>();

    // When we make this object, we tell it where to save the file
    public CSVDataWriter(String outputPath) {
        this.outputPath = outputPath;
        
        //first line (column names)
        rows.add("timeSec,x,y");
    }

    // Add one new line of data (time, x, y)
    public void addRecord(double timeSec, int x, int y) {
        // Make one line with time, x, y
        String line = String.format("%.2f,%d,%d", timeSec, x, y);
        
        // Store in list
        rows.add(line);
    }

    // Save all the lines into a real CSV file
    public void save() {
        try {
            // Open the file for writing
            FileWriter writer = new FileWriter(outputPath);
            
            // Write each line into the file
            for (String row : rows) {
                writer.write(row + "\n");
            }
            writer.close();
            System.out.println("File saved: " + outputPath);
            
        } catch (IOException e) {
            System.err.println("Error saving file: " + e.getMessage());
        }
    }
}