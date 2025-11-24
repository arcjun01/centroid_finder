so overall we are analyzing an image to find place that are similar to a given color. Its also converting the image to black and white to find connected white pixel group and output the size and centroid in the csv file.

- ImageSummaryApp: it loads the image then reads the target color, binarizes the image using the given color(white if pixels are close to the given color, black if pixels are farther away), then save the image, finds connected groups of white pixels and output the result in groups.csv

- colorDistanceFinder: it calculates the distance between two colors.

- EuclideanColorDistance: it calculates the distance between two color in RGB space (sqrt((r1 - r2)^2 + (g1 - g2)^2 + (b1 - b2)^2))
 (This file figures out how different two colors are by using math. It treats each color like a point made of red, green, and blue values, then uses the distance formula to see how far apart they are — bigger numbers mean the colors look more different.)

- ImageBinarizer: It changes a picture to black and white and can also turn that binary image back into a normal picture.

-  DistanceImageBinarizer: it use the formula color distance to decide if the pixel is black or white. if its in within the threshold then white(1), if outside the threshold black(0). Also converts between RGB image and binary 2D array

- BinaryGroupFinder: it is just a rule (an interface) that says any class using it must have a method to find groups of connected 1s in a grid of 0s and 1s. It looks for white pixels (1s) that touch up, down, left, or right—not diagonally—and returns all the groups it finds, sorted from biggest to smallest.

- DfsBinaryGroupFinder:(finds connected white pixel group) it finds groups of 1s that touch each other in a grid using depth-first search and lists them from biggest group to smallest.

- ImageGroupFinder: It’s an interface that finds connected groups in a picture and returns them from biggest to smallest.


- BinarizingImageGroupFinder: it takes a picture, changes it to black and white using another class, then finds all the white spots that are connected together. It gives back a list of those white pixel groups.


- Group: show one group of white pixels connected and takes 2 fields where size is number of the pixels in the group and centroid is center coordinate. 

- Coordinate: it holds x, y position in the image. x increases right and y increases down



















