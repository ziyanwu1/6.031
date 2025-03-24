// Puzzle ADT specs + t.s.
// specs and testing strategy for puzzle ADT (no choosing tests or implementing)

/** An immutable puzzle ADT that can represent valid unsolved, partiallly-solved, and fully-solved puzzles. 
 * Represents a puzzle, ie an nxn grid solved by placing 2n stars to satisfy constraints. 
*/
class Puzzle{
    // Abstraction function
    //    AF(n, grid, regions) = the nxn puzzle divided into regions given by 'regions'. 
    //                           grid[row][col] = state of the board at coordinate (row,col)
    // Rep invariant
    //    The puzzle has a unique solution. 
    //    n is a positive integer.
    //    Every nested Array in grid has length n, and grid has length n (ie the grid is a 2d nxn array) 
    //    Every region in regions is contiguous (each cell is adjacent to another cell in the region)
    // Safety from rep exposure
    //    n is immutable and unreassignable
    //    grid and regions are mutable objects, but private (never modified) and defensively copied in the constructor

    public constructor(public readonly n: number, 
                       private readonly grid: Array<Array<Cell>>, 
                       private readonly regions: Array<Set<{row:number, col:number}>>){
        throw Error('not implemented yet');
    }

    /** If the puzzle is blank or full, returns a parseable string representation. */
    public toString(): string{
        throw Error('not implemented yet');
    }

    /** Returns true if every cell in the puzzle has a known state, and false otherwise */
    public isFull(): boolean {
        throw Error('not implemented yet');
    }

    /** Returns true if the puzzle currently has a placement of 2n stars such that each 
    * row, each column, and each region of the puzzle has exactly 2 stars, 
    * and no stars are vertically, horizontally, or diagonally adjacent.  */
    public isSolved(): boolean {
        throw Error('not implemented yet');
    }

    /** Check the Rep Invariant */
    private checkRep(): void{
        throw Error('not implemented yet');
    }

}

/** An enum representing the status of a cell (whether the state is unknown, 
 * whether the cell is marked empty, or whether it contains a star) */
enum Cell{ UNKNOWN, EMPTY, STAR }

// TESTING STRATEGY FOR PUZZLE
// Cover all subdomains:
//  State of board: Empty, partially full, full
//  Placement of stars on a full board: Correctly solved, incorrect

