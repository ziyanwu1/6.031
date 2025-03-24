import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';

/**
 * For now, the grammars for solved and unsolved puzzles remain the same. The first line
 * of the puzzle denotes the dimensions of the puzzle (should be 10x10). Every other line
 * represents its own separate cell, with the coordinates being separated by whitespace, 
 * starred cells of the solved puzzle going on the left side of the grid, and unstarred
 * cells of the solved puzzle going on the right side. 
 */

const solvedGrammar: string = `
    puzzle ::= (comment)* dimensions '\\n' (puzzleCell '\\n')+
    comment ::= '#' words '\\n'
    dimensions ::= number 'x' number
    puzzleCell ::= (coordinate whitespace)+ '|' (whitespace coordinate)*
    coordinate ::= number ',' number 

    words ::= [^\\n]*
    number ::= [0-9]+
    whitespace ::= [ ]+
`