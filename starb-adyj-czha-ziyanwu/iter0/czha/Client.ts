// Client ADT specs + t.s.
// specs and testing strategy for client ADT (no choosing tests or implementing)

// [for now] The client may use only canvas drawing, and may not use any other HTML elements.

/** An ADT to manage the state and operations of the client web page */
export class Client{

    public puzzle: Puzzle;

    /** Request the single puzzle given by the PUZZLE constant in StarbClient */
    public requestBlankPuzzle(): Puzzle{
        throw Error("Not implemented yet");
    }

    /** Display the puzzle on screen to the user, including the stars on the grid */
    public displayPuzzle(): void{
        throw Error("Not implemented yet");
    }

    /** Interface with Puzzle ADT to determine whether the puzzle is solved. */
    public isPuzzleSolved(): boolean{
        throw Error("Not implemented yet");
    }

    /** Once the user solves the puzzle, send a message to inform the user. 
     * @requires Puzzle must be solved
    */
    public announceSolved(): void{
        throw Error("Not implemented yet");
    }

    /** On startup, display instructions to the user on the web page */
    public displayInstructions(): void{
        throw Error("Not implemented yet");
    }

    /** Add a star to the grid at (row, col) 
     * Does nothing if the given coordinate already contains a star. 
     * @param row the row coordinate to place the star
     * @param col the column coordinate to place the star
     * @throws Error if the given coordinate is marked to be empty 
     * (Marking emptiness is not a required behavior)
    */
    public addStar(row: number, col: number): void{
        throw Error("Not implemented yet");
    }

    /** Remove a star from the grid at (row, col) 
     * @param row the row coordinate to remove the star
     * @param col the column coordinate to remove the star
     * @throws Error if the given coordinate does not contain a star
    */
    public removeStar(row: number, col: number): void{
        throw Error("Not implemented yet");
    }

}

//TESTING STRATEGY
// Test behavior of each function:
//  no partition needed for requestBlankPuzzle, isPuzzleSolved, announceSolved, displayInstructions
//  addStar, removeStar:
//      partition on state of coordinate:
//          coordinate is unknown, marked empty (not required behavior), or contains a star
//      partition on location of coordinate:
//          corners of the grid, a side of the grid, or a central square of the grid (ie not a border)
