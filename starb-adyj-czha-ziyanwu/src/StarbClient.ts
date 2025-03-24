/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.

import assert from 'assert';
import { Coord, Puzzle } from './Puzzle';
import { COLORS, drawCell, drawStar } from './Drawing';
import {handleClick, displayInstructions} from './Interaction';
import { parseExpression } from './Parser';


/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE = "kd-1-1-1";

// [for now] The client may use only canvas drawing, and may not use any other HTML elements.

/** An ADT to manage the state and operations of the client web page */
export class Client{

    /**
     * ABSTRACTION FUNCTION:
     *      AF(filetext, canvas) = A client that acts on the puzzle represented by the contents of
     *                             `filetext` and draws the puzzle onto `canvas.`
     * 
     * REP INVARIANT:
     *      true
     * 
     * SAFETY FROM REP EXPOSURE:
     *      `puzzle` and `canvas` ae private variables that cannot be accessed outside of the Client.
     */

    private puzzle: Puzzle;

    public constructor(filetext: string, private readonly canvas: HTMLCanvasElement) {
        this.puzzle = parseExpression(filetext);
    }

    /**
     * Switch from cell (row, col) to mouse (x, y) 
     * 
     * @param cell cell coordinate
     * @returns The equivalent mouse coordinate.
     */
    private cellToMouse(cell: Coord): Coord {
        const cellSize = this.canvas.height / this.puzzle.getDimension();
        return [cell[1] * cellSize - 1, cell[0] * cellSize - 1];
    }

    /**
     * Converts mouse click coordinates (relative to top left of canvas) to puzzle coordinates
     * 
     * @param x x coordinate of mouse click on canvas
     * @param y y coord of mouse click
     * @returns puzzle coordinate of cell that was clicked on
     */
    private mouseToCell(x: number, y:number): {row: number, col: number} {
        const cellSize = this.canvas.height / this.puzzle.getDimension();
        return {row: Math.floor(y/cellSize) + 1, col: Math.floor(x/cellSize) + 1};
    }

    /** 
     * Draws and displays the puzzle on screen to the user, including the stars on the grid.
     */
    public displayPuzzle(): void {
        let colorIndex = 0;  // Index of color to find in COLOR
        for (const region of this.puzzle.getRegions()) {  // Iterate through all of the regions
            for (const cell of region) {  // To color all of the cells the right color.
                const cellCoord: Coord = this.puzzle.numToCoord(cell);
                const mouseCoord: Coord = this.cellToMouse(cellCoord);
                drawCell(this.canvas, mouseCoord[0], mouseCoord[1], COLORS[colorIndex] ?? assert.fail("no colors found"));  // Draw the background.
                if (this.puzzle.getValue(cellCoord[0], cellCoord[1]) === "star") {
                    drawStar(this.canvas, mouseCoord[0], mouseCoord[1]);  // Draw a star if there should be a star.
                }
            }
            colorIndex++;  // Shift to the next color for the next index.
        }
    }

    /** 
     * Interface with Puzzle ADT to determine whether the puzzle is solved. 
     * 
     * @returns whether or not the puzzle is solved yet
     */
    public isPuzzleSolved(): boolean {
        return this.puzzle.solved();
    }

    /** 
     * Return a message to inform the user if the puzzle is solved or not
     * 
     * @returns creates the message that goes in the text box of the html
     */
    public announceSolved(): string {
        if (this.isPuzzleSolved()){
            return "Puzzle is solved!";
        }
        else{
            return "Puzzle is in progress";
        }
    }

    /** 
     * Given xy-coordinates of a click on the canvas, modify the corresponding (row, col) coordinate of the board
     * Toggles between adding and removing a star. 
     * 
     * @param x the x coordinate of the click
     * @param y the y coordinate of the click
     */
    public click(x: number, y: number): void {
        const puzzleCoord = this.mouseToCell(x, y);
        this.puzzle = this.puzzle.clickOn(puzzleCoord.row, puzzleCoord.col);
        this.displayPuzzle();
    }

}


/**
 * Set up the page.
 */
async function main(): Promise<void> {
    
    const PORT = 8789;
    const FILE = 'kd-1-1-1';
    const url = `http://localhost:${PORT}/blank-puzzle?file=${FILE}`;
    const response = await fetch(url); 

    const filetext = await response.text();

    const canvas = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
    const client = new Client(filetext, canvas);
    
    client.displayPuzzle();

    displayInstructions();

    // when the user clicks on the drawing canvas...
    canvas.addEventListener('click', (event: MouseEvent) => handleClick(client, canvas, event.offsetX, event.offsetY));
}

main().then().catch(() => assert.fail("main function failed"));