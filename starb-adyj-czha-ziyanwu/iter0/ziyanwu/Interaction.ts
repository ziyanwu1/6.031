/**
 * Manual Test: Clicking on an Empty space (Empty implies no dot which implies a valid space)
 * Covers: Interaction, Client ADT, Server, Drawing, Puzzle
 * 
 * 1. Navigate mouse to a cell position with an empty space
 * 2. Press on that cell on the board => assert that a star appears on the space AND any applicable dots also appear
 * 
 */


/**
 * Manual Test: clicking on a star
 * Covers: Interaction, Client ADT, Server, Drawing, Puzzle
 * 
 * 1. Navigate mouse to a cell position with a star
 * 2. Press on that cell => assert that the star is removed AND any applicable dots are also removed
 * 
 */


/**
 * Manual Test: clicking on a dotted space
 * Covers: Interaction, Client ADT, Server, Drawing, Puzzle
 * 
 * 1. Navigate mouse to a cell position with a dotted space
 * 2. Press on that cell => assert that nothing happens 
 * 
 */


/**
 * Manual Test: user requests to see if puzzle is solved when puzzle is correctly solved
 * Covers: Interaction, Client ADT, Server, Puzzle
 * 
 * 1. Navigate mouse to the isSolved button
 * 2. Press on the button => assert a win message is displayed
 * 
 */


/**
 * Manual Test: user requests to see if puzzle is solved when puzzle isn't solved yet
 * Covers: Interaction, Client ADT, Server, Puzzle
 * 
 * 1. Navigate mouse to the isSolved button
 * 2. Press on the button => assert that a not win message is displayed
 * 
 */