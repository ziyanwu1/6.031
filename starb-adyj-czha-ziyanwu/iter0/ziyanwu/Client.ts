import {Puzzle} from './Puzzle';

/**
 *  Testing Strategy:
 * 
 *  getBlankPuzzle():
 *      no partitions needed
 * 
 *  displayPuzzle():
 *      partition on if stars (and therefore dots) exist: true, false
 *      partition on number of stars: 0, 1, > 1
 *  
 *  draw():
 *      partition on location: corner, boundary cell, middle
 *      partition on valid location to draw: yes, no
 * 
 *  remove():
 *      partition on location: corner, boundary cell, middle
 *      partition on valid location to draw: yes, no
 * 
 *  isSolved():
 *      partition on solved: true, false
 * 
 */ 

/**
 * A data type representing a user Client
 * 
 */
class Client {

    /**
     * Create a new Client object
     */
    public constructor() {
        throw new Error("Not Implemented Yet");
    }

    /**
     * @returns a blank puzzle
     */
    public getBlankPuzzle(): Puzzle {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Displays the puzzle on the client's screen, including all stars, dots, and regions
     */
    public displayPuzzle(): void {
        throw new Error("Not Implemented Yet");
    }  

    /**
     * Adds a star to the client's game 
     * 
     * @param x  x-coordinate of the point to draw
     * @param y  y-coordinate of the point to draw
     * 
     * @throws an Error if player is trying to draw on an invalid location
     */
    public draw(x: number, y: number): void {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Removes a star to client's game
     * 
     * @param x  x-coordinate of the point to draw
     * @param y  y-coordinate of the point to draw
     */
    public remove(x: number, y: number): void {
        throw new Error("Not Implemented Yet");
    }

    /**
     * @returns Whether or not the game is solved yet or not
     */
    public isSolved(): boolean {
        throw new Error("Not Implemented Yet");
    }

}