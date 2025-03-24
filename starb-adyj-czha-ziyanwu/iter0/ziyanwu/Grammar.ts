// example input: *see kd-1-1-1.starb*

// looks like we have to support comments with the "#" symbol
// then it looks like we have to get the dimensions "number" "x" "number"
// then we have to extract the coordinates that have stars (which are the coords left of the '|' symbol) and the info of empty spaces (coords to the right of the '|' symbol)
// for dots, we can just calculate that every time instead of storing it


// some assumptions: comments ONLY go before the dimension. The dimension then comes next. Then comes the board

const grammar = `
@skip whitespace {
    puzzle ::= comments* dimensions line*;
    comments ::= '#' words '\n';
    dimensions ::= number 'x' number;
    line ::= coord{0,2} "|" coord* "\n";
}

coord ::= number "," number;
number ::= [0-9]+;
words ::= [^\\t\\r\\n]*; 
`