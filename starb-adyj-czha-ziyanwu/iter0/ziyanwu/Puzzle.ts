/**
 *  Testing Strategy:
 * 
 *  draw():
 *      partition on location: corner, boundary cell, middle
 *      partition on valid location to draw: yes, no
 * 
 *  remove():
 *      partition on location: corner, boundary cell, middle
 *      partition on current cell value: empty, dot, star
 * 
 *  getRegion():
 *      partition on location: corner, boundary cell, middle
 * 
 *  getValue():
 *      partition on location: corner, boundary cell, middle
 *      
 *  getCurrentBoard():
 *      no partitions needed
 *  
 *  equalValue():
 *      partition on equality: true, false
 *  
 *  toString():
 *      no partitions needed
 * 
 */



/**
 * An immutable data type representing a puzzle.
 * 
 * We're given that a puzzle is a 10x10 grid with 10 nonoverlapping regions. (n=10)
 * A puzzle contains stars, dots, and empty spaces. 
 * Stars are the pieces that we can place on the board. Dots are the spaces on the board where it is invalid for a Star to go. Empty spaces are valid places where Stars can go.
 * The goal of the game is to place 2n stars such that each row, column, and region each has erowactly 2 stars.
 * Stars can not be vertically, horizontally, or diagnoally adjacent to each other. 
 */
export class Puzzle {

    /**
     * Construct our internal representation of a puzzle, given a string input of what points belong to which region.
     * Assumes all puzzles start off with no stars on the board.
     * 
     * @param s  string representation of the board, corresponding each coordinate with a region number
     */
    public constructor(s: string) {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Returns a new board after drawing a star on the board
     * 
     * @param row  the row-coordinate we want to draw on
     * @param col  the column-coordinate we want to draw on
     * 
     * @returns a Puzzle object representing the new state of the board
     * @throws an Error if player is trying to draw on an invalid location
     */
    public draw(row: number, col: number): Puzzle {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Returns a new board after removing a star from a cell
     * 
     * @param row  the row-coordinate we want to draw on
     * @param col  the column-coordinate we want to draw on
     * 
     * @returns a Puzzle object representing the new state of the board
     */
    public remove(row: number, col: number): Puzzle {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Gets the region a point is located in
     * 
     * @param row  the row-coordinate of our point
     * @param col  the column-coordinate of our point
     * 
     * @returns the number where the coordinate point is located
     */
    public getRegion(row: number, col: number): number {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Gets the value of the cell location
     * 
     * @param row  the row-coordinate of our cell
     * @param col  the column-coordinate of our cell
     */
    public getValue(row: number, col: number): string {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Returns the current board state
     * 
     * @returns the board
     */
    public getCurrentBoard(): Puzzle {
        throw new Error("Not Implemented Yet");
    }

    /**
     * Returns whether or not two Puzzle objects are equal
     * 
     * @param that  another Puzzle
     * 
     * @returns whether or not both are equal in value
     */
    public equalValue(that: Puzzle): boolean {
        throw new Error("Not Implemented Yet");
    }

    /**
     * @returns a human-readable string representation of a Puzzle
     */
    public toString(): string {
        throw new Error("Not Implemented Yet");
    }
}