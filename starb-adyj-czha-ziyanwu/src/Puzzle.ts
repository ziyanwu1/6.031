/**
 * An immutable data type representing a puzzle.
 * 
 * We're given that a puzzle is a 10x10 grid with 10 nonoverlapping regions. (n=10)
 * A puzzle contains stars, dots, and empty spaces. 
 * Stars are the pieces that we can place on the board. Dots are the spaces on the board where it is invalid for a Star to go. Empty spaces are valid places where Stars can go.
 * The goal of the game is to place 2n stars such that each row, column, and region each has erowactly 2 stars.
 * Stars can not be vertically, horizontally, or diagnoally adjacent to each other. 
 */

import * as fs from 'fs';
import { parseExpression } from './Parser';
import assert from 'assert';

export type Coord = [number, number];
export class Puzzle {
    /**
     * ABSTRACTION FUNCTION:
     *      AF(regions, starredCells, dimension, = A star battle puzzle, where the regions are divided according 
     *         numStars)                           to `regions` and all cells in `starredCells` are starred by 
     *                                             the user. Note that each element of `starredCells` and of each 
     *                                             subset of `regions` is a number that represents the set, where 
     *                                             the top left cell is 1, the bottom right cell is dimension ** 2, 
     *                                             and cell numbers increase by 1 going from left to right.
     *                                             `dimension` is the number of rows, columns, and regions in the
     *                                             puzzle, and numStars is the number of stars in each row, column,
     *                                             and region of the puzzle.
     * REPRESENTATION INVARIANT:
     *      1.  No region in `regions` overlap.
     *      2.  Both of `region` and `starredCells` consists of integers within the range [1, `dimension`**2].
     *      3.  There are exactly `dimension` sets in `regions`, all of which are at least of size `numStars`.
     *      
     * SAFETY FROM REP EXPOSURE:
     *      1.  All of `region`, `starredCells`, `dimension`, and `numStars` are private and cannot be mutated 
     *          outside of the class.
     *      2.  All of `region`, `starredCells`, `dimension`, and `numStars` are readonly, so they're not mutable.
     *          There also does not exist any mutators on the sets.
     *      3.  Getter methods and constructors copy `region` and `starredCells` into new arrays and sets, as to
     *          not cause any potential aliasing issues.
     */


    /**
     * tells us whether a given coordinate is valid in our grid
     * 
     * @param  c  a coordinate value we want to look at
     * @throws an error if the coord is an 'invalid' coordinate, meaning the coordinate contains non-integers
     *         or numbers outside of the (0, 10] range.
     */
    private validCoord(c: Coord): void {
        assert.strictEqual(c[0], Math.floor(c[0]), "Expected coords to have integers.");
        assert.strictEqual(c[1], Math.floor(c[1]), "Expected coords to have integers.");
        assert(c[0] > 0 && c[0] <= this.dimensions, "Expected coords to have numbers in the range [1, dimension].");
        assert(c[1] > 0 && c[1] <= this.dimensions, "Expected coords to have numbers in the range [1, dimension].");
    }


    /**
     * Returns the coordinate representation of a number.
     * 
     * @param num Number to convert into a coord type.
     * @returns a coordinate c such that (c[0] - 1) * dimension + c[1] = num and that c is valid, according
     *          to the validCoord function.
     */
    public numToCoord(num: number): Coord {
        const tempCol: number = num % this.dimensions;
        const coordCol: number = tempCol===0 ? this.dimensions : tempCol;
        const coordRow = (num - coordCol) / this.dimensions + 1;

        this.validCoord([coordRow, coordCol]);  // Make sure the returned coordinate is valid.
        return [coordRow, coordCol];
    }


    /**
     * Returns the number representation of a coordinate.
     * 
     * @param c Valid coord to convert into a number type.
     * @returns (c[0] - 1) * dimension + c[1]
     */
    public coordToNum(c: Coord): number {
        return (c[0] - 1) * this.dimensions + c[1];
    }


    /**
     * Given a cell as a number, return an array of all cells (as numbers) bordering it.
     * 
     * @param cell as a number from 1 to dimension**2
     * @returns an array of all numbers adjacent to it in the puzzle.
     */
    private borderingCellNumbers(cell: number): Set<number> {
        const borderingCells: Set<number> = new Set([]);
        if (cell > this.dimensions) borderingCells.add(cell - this.dimensions);  // Add upper cell if current cell isn't on top edge.
        if (cell < this.dimensions * (this.dimensions - 1)) borderingCells.add(cell + this.dimensions);  // lower & bottom cell
        if (cell % this.dimensions !== 0) borderingCells.add(cell + 1);  // right cell
        if (cell % this.dimensions !== 1) borderingCells.add(cell - 1);  // left cell
        return borderingCells;
    }

    /**
     * Given a cell as a number, return an array of all cells (as numbers) touching it (including diagonlly).
     * 
     * @param cell as a number from 1 to dimension **2
     * @returns an array of all numbers touching it in the puzzle (including diagonally)
     */
    private touchingCellNumbers(cell: number): Set<number> {
        const touchingCells: Set<number> = this.borderingCellNumbers(cell);  // Add bordering cells in.
        if (cell > this.dimensions && cell % this.dimensions !== 0) touchingCells.add(cell + 1 - this.dimensions);  // Upper-right
        if (cell < this.dimensions * (this.dimensions - 1) && cell % this.dimensions !== 0) touchingCells.add(cell + 1 + this.dimensions);  // Lower-right
        if (cell > this.dimensions && cell % this.dimensions !== 1) touchingCells.add(cell - 1 - this.dimensions);  // Upper-left
        if (cell < this.dimensions * (this.dimensions - 1) && cell % this.dimensions !== 1) touchingCells.add(cell - 1 + this.dimensions);  // Lower-left
        return touchingCells;
    }


    /**
     * Given two sets of numbers, returns True, if the two sets are equal.
     * 
     * @param set1 First set of numbers
     * @param set2 Second set of numbers
     * @returns True iff the two sets are equal.
     */
    private sameNumbers(set1: Set<number>, set2: Set<number>): boolean {
        const set1IsSubset: boolean = set1.size === [...set1].filter((num: number) => set2.has(num)).length;
        const set2IsSubset: boolean = set2.size === [...set2].filter((num: number) => set1.has(num)).length;
        return set1IsSubset && set2IsSubset;  // Two sets are equal if they're subsets of each other.
    }


    /**
     * Function checkRep. Checks that:
     * 1.  No region in `regions` overlap or is discontinuous.
     * 2.  Both of `region` and `starredCells` consists of integers within the range [1, `dimension`**2].
     * 3.  There are exactly `dimension` sets in `regions`, all of which are at least of size `numStars`.
     * 4.  All numbers between 1 and `dimension` ** 2 are in `regions`.
     * 
     * @throws an error if any of the above is not true.
     */
    private checkRep(): void {
        /* There are exactly `dimension` sets in `regions`. */
        const allCells: Set<number> = new Set([]);  // Track all cells in this.regions
        for (const region of this.regions) {
            /* All of the regions are at least of size `numStars`. */
            assert(region.size >= this.numStars, "Expected regions to have sufficient number of cells.");
            for (const cell of region) {
                /* No region in `regions` overlap */
                assert(! allCells.has(cell), "Puzzle has overlapping regions.");  
                allCells.add(cell);
                /* `region` consists of integers within the range [1, `dimension`**2] */
                this.validCoord(this.numToCoord(cell));
            }
        }
        /* All numbers between 1 and `dimension` ** 2 are in `regions`. */
        assert.strictEqual(this.dimensions ** 2, allCells.size, "Expected all dimension**2 cells in puzzle regions.");

        /* `starredCells` consists of integers within the range [1, `dimension`**2]. */
        for (const cell of this.starredCells) this.validCoord(this.numToCoord(cell));
    }


    /**
     * Construct our internal representation of a puzzle, given a string input of what points belong to which region.
     * Assumes all puzzles start off with no stars on the board.
     * 
     * @param regions A set of sets of coords where each sub-set is in the same region.
     * @param starredCells A set of cells currently starred.
     */
    private readonly dimensions = 10;
    private readonly numStars = 2;
    private readonly regions: Array<Set<number>>;
    private readonly starredCells: Set<number>;
    public constructor(
        regions: Array<Set<number>>, 
        starredCells: Set<number>
    ) {
        /* Copy regions into this.regions attribute. */
        this.regions = [];
        for (const region of regions) {  // Iterate through everything to fully copy the region.
            const newRegion: Set<number> = new Set([]);
            for (const cell of region) newRegion.add(cell);
            this.regions.push(newRegion);
        }

        /* Copy starred cells into this.starredCells attribute. */
        this.starredCells = new Set([]);
        for (const cell of starredCells) {
            this.starredCells.add(cell);
        }

        this.checkRep();
    }


    /**
     * Returns a new board after clicking a cell. If there's a star there, remove it. Otherwise,
     * add a star to that cell.
     * 
     * @param row  the row-coordinate we want to draw on
     * @param col  the column-coordinate we want to draw on
     * 
     * @returns a Puzzle object representing the new state of the board
     * @throws an error if parameters don't make a valid coord.
     */
    public clickOn(row: number, col: number): Puzzle {
        this.validCoord([row, col]);
        const cellNum: number = this.coordToNum([row, col]);
        const newStarredCells: Set<number> = new Set([]);  // New set of starred cells for the returned puzzle.
        for (const cell of this.starredCells) {
            if (cell !== cellNum) newStarredCells.add(cell);  // Add cell to new set, unless we're clicking on a starred cell.
        }
        if (! this.starredCells.has(cellNum)) newStarredCells.add(cellNum);  // Star the cell if not already starred.
        return new Puzzle(this.regions, newStarredCells);
    }


    /**
     * Gets the region a point is located in
     * 
     * @param row  the row-coordinate of our point
     * @param col  the column-coordinate of our point
     * 
     * @returns the number where the coordinate point is located
     * @throws an error if parameters don't make a valid coord.
     */
    public getRegion(row: number, col: number): Set<number> {
        this.validCoord([row, col]);
        const cellNum: number = this.coordToNum([row, col]);
        for (const region of this.regions) {  // Iterate through regions and return a region if it has the cell.
            if (region.has(cellNum)) return region;
        }
        throw new Error("The checkRep() screwed up. We shouldn't ever have gotten here.");
    }


    /**
     * Gets the value of the cell location
     * 
     * @param row  the row-coordinate of our cell
     * @param col  the column-coordinate of our cell
     * 
     * @returns "star" or "blank" depending on whether there's a star in the cell or not.
     * @throws an error if parameters don't make a valid coord.
     */
    public getValue(row: number, col: number): "star"|"blank" {
        this.validCoord([row, col]);
        const cellNum: number = this.coordToNum([row, col]);
        if (this.starredCells.has(cellNum)) return "star";  // Return 'star' if cell is starred.
        return "blank";  // Otherwise, return "blank".
    }


    /**
     * @returns A copy of this.regions
     */
    public getRegions(): Array<Set<number>> {
        const regions: Array<Set<number>> = [];
        for (const region of this.regions) {  // Iterate through everything to fully copy the region.
            const newRegion: Set<number> = new Set([]);
            for (const cell of region) newRegion.add(cell);
            regions.push(newRegion);
        }
        return regions;
    }


    /**
     * @returns this.starredCells;
     */
    public getStarredCells(): Set<number> {
        const starredCells: Set<number> = new Set([]);
        for (const cell of this.starredCells) {
            starredCells.add(cell);
        }
        return starredCells;
    }


    /**
     * @returns this.dimension;
     */
    public getDimension(): number {
        return this.dimensions;
    }


    /**
     * Returns whether or not two Puzzle objects are equal
     * 
     * @param that another Puzzle
     * @returns whether or not both are equal in value
     */
    public equalValue(that: Puzzle): boolean {
        /* Check that this.region is a subset of that.region. */
        for (const thisRegion of this.regions) {
            let thatHasRegion = false;
            for (const thatRegion of that.getRegions()) {
                if (this.sameNumbers(thisRegion, thatRegion)) {
                    thatHasRegion = true;  // If region is found, move on.
                    break;
                }
            }
            if (! thatHasRegion) {
                return false;
            }  // Otherwise, the puzzles are not equal.
        }

        /* Check that that.region is a subset of this.region. */
        for (const thatRegion of that.getRegions()) {
            let thisHasRegion = false;
            for (const thisRegion of this.regions) {
                if (this.sameNumbers(thisRegion, thatRegion)) {
                    thisHasRegion = true;  // If region is found, move on.
                    break;
                }
            }
            if (! thisHasRegion) {
                return false;
            }  // Otherwise, the puzzles are not equal.
        }

        /* If the regions are equal, check the starred cells. */
        return this.sameNumbers(this.starredCells, that.getStarredCells());
    }

    /**
     * @returns a boolean denoting whether the starredCells are completely correct.
     */
    public solved(): boolean {

        /* Check for any touching cells. */
        for (const cell1 of this.starredCells) {
            for (const cell2 of this.starredCells) {
                if (cell1 === cell2) continue;  // Ignore if you're just comparing the cell to itself.
                if (this.touchingCellNumbers(cell1).has(cell2)) {  // Starred cells touching each other is not allowed.
                    return false;
                }
            }
        }

        /* Check each row/column for two stars each. */
        for (let i = 0; i < this.dimensions; i++) {
            if ([...this.starredCells].filter((num: number) => Math.floor((num - 1) / this.dimensions) === i).length !== this.numStars) {
                return false;  // Rows
            }
            if ([...this.starredCells].filter((num: number) => num % this.dimensions === i).length !== this.numStars) {
                return false;  // Columns
            }
        }

        /* Check each region. */
        for (const region of this.regions) {
            if([...region].filter((num: number) => this.starredCells.has(num)).length !== 2) {
                return false;
            }
        }
        
        /* If we get past all of the checks above, finally, return true. The puzzle is solved. */
        return true;
    }

    /**
     * @returns a human-readable string representation of a Puzzle
     */
    public toString(): string {
        return this.regions.toString();
    }

}