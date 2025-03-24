import assert from 'assert';
import { Parser, ParseTree, compile} from 'parserlib';
import {Puzzle, Coord} from './Puzzle';

const PUZZLE_SIZE = 10;

/**
 * For now, the grammars for solved and unsolved puzzles remain the same. The first line
 * of the puzzle denotes the dimensions of the puzzle (should be 10x10). Every other line
 * represents its own separate cell, with the coordinates being separated by whitespace, 
 * starred cells of the solved puzzle going on the left side of the grid, and unstarred
 * cells of the solved puzzle going on the right side. 
 */

// some assumptions: comments ONLY go before the dimension. The dimension then comes next. Then comes the board

const grammar = `
@skip whitespace {
    puzzle ::= comment* dimensions line*;
    comment ::= '#' word '\\n';
    dimensions ::= number 'x' number '\\n';
    line ::= (coord{2})? bar coord* '\\n';
    coord ::= number "," number;
}
whitespace ::= [ \\t\\r]+;
number ::= [0-9]+;
word ::= [^\\t\\r\\n]*; 
bar ::= '|';
`;


// the nonterminals of the grammar
enum PuzzleGrammar {
    Puzzle, Comment, Coord, Number, Word, Dimensions, Whitespace, Line, Bar
}

// compile the grammar into a parser
const parser: Parser<PuzzleGrammar> = compile(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);

/**
 * Parse a string into a Puzzle.
 * 
 * @param input string to parse
 * @returns Puzzle parsed from the string
 * @throws ParseError if the string doesn't match the Puzzle grammar
 */
export function parseExpression(input: string): Puzzle {
    
    // parse the example into a parse tree
    const parseTree: ParseTree<PuzzleGrammar> = parser.parse(input);

    // make an AST from the parse tree
    const puzzle: Puzzle = makeAbstractSyntaxTree(parseTree);
    
    return puzzle;
}

/**
 * Convert a parse tree into an abstract syntax tree.
 * 
 * @param parseTree constructed according to the grammar for puzzle boards
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree: ParseTree<PuzzleGrammar>): Puzzle {
    
    /**
     * Returns flattened form of column in the range [1, PUZZLE_SIZE^2] to index a 1d array in row-major order
     * 
     * Assumes coord[0] = row, coord[1] = column; 1-indexed
     * 
     * @param c  coordinate tuple of length 2
     * 
     * @returns the translated index position from a (row,col) coordinate
     */
    function flattenCoord(c: Coord): number{
        const row = c[0];
        const col = c[1];
        return (row-1)*PUZZLE_SIZE + col;
    }

    const regions = new Array<Set<number>>;
    const starCoords = new Set<number>; 

    // puzzle ::= comment* dimension line*;
    const comment: ParseTree<PuzzleGrammar>[] = parseTree.childrenByName(PuzzleGrammar.Comment);
    // dimensions ::= number 'x' number;
    // dimensions can be used to generalize the size of a board in the future
    const dimensions: ParseTree<PuzzleGrammar>[] = parseTree.childrenByName(PuzzleGrammar.Dimensions);

    const lines: ParseTree<PuzzleGrammar>[] = parseTree.childrenByName(PuzzleGrammar.Line);
    for (const line of lines){
        // line ::= coord{0,2} "|" coord* "\n";
        
        const region = new Set<number>;

        let starLocation = true;

        for (const child of line.children){
            if (child.name === PuzzleGrammar.Bar){
                starLocation = false;
                continue; // no coordinate here, skip the bar itself
            }
            const coordTuple = child.text.trim().split(',').map(x=> parseInt(x)); //why do i need to trim???
            const actualCoord: number = flattenCoord([
                    coordTuple[0] ?? assert.fail("expected coordinate to have a row value"), 
                    coordTuple[1] ?? assert.fail("expected coordinate to have a column value")
                ]);

            if (starLocation){
                starCoords.add(actualCoord);// this coord is occupied by a star
            }

            region.add(actualCoord); //but also is part of the region
        }

        regions.push(region);
    }

    const puzzle: Puzzle = new Puzzle(regions, starCoords);
    return puzzle;

}

