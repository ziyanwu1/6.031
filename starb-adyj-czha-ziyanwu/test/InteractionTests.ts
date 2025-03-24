/**
 * Manual Test: Solve Puzzle
 * Covers: Client ADT, Puzzle ADT, Drawing
 * 
 * 1. Open up the puzzle associated with file kd-1-1-1.starb.
 * 2. Click on spaces associated with points:
 *       1,2  1,5 
 *       2,9  4,10
 *       3,2  3,4 
 *       2,7  4,8 
 *       6,1  9,1 
 *       5,4  5,6 
 *       6,8  8,7 
 *       7,3  7,5 
 *       8,9 10,10
 *       9,3  10,6
 * => assert that the site tells you the puzzle is completed.
 */


/**
 * Manual Test: Clicking on an Empty space (No star, no dot)
 * Covers: Interaction, Client ADT, Server, Drawing, Puzzle ADT
 * 
 * 1. Navigate mouse to a cell position with an empty space
 * 2. Click on the cell on the board => assert that a star appears on the space 
 * (Optional add on if time: AND any applicable dots also appear)
 * 
 */


/**
 * Manual Test: Clicking on a star
 * Covers: Interaction, Client ADT, Server, Drawing, Puzzle
 * 
 * 1. Navigate mouse to a cell position with a star
 * 2. Click on that cell => assert that the star is removed 
 * (Optional add on if time: AND any applicable dots are also removed)
 * 
 */


//  OPTIONAL IFF TIME
//  /**
//  * Manual Test: clicking on a dotted space
//  * Covers: Interaction, Client ADT, Server, Drawing, Puzzle
//  * 
//  * 1. Navigate mouse to a cell position with a dotted space
//  * 2. Press on that cell => assert that nothing happens 
//  * 
//  */