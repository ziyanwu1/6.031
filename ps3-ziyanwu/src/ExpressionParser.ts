/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Expression, GlueSide, Resize, Filename, Dimension, Caption, TopOverlay, Underscore, GlueTopBottom } from './Expression';
import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';

/**
 * Parser for image meme expressions.
 * 
 * PS3 instructions: you are free to change this file.
 */

// the grammar
const grammar = `
@skip whitespace {
    expression ::= glueside (topToBottomOperator glueside)*;
    glueside ::= underscore ('|' underscore)*;
    underscore ::= overlay ('_' overlay)*;
    overlay ::= resize ('^' resize)*;
    resize ::= primitive ('@' number 'x' number)*;
    primitive ::= filename | '"' caption '"' | '(' expression ')';
}
topToBottomOperator ::= '---' '-'*;
filename ::= [A-Za-z0-9.][A-Za-z0-9._-]*;
number ::= '?' | [0-9]+;
caption ::= [^\\n"]*;
whitespace ::= [ \\t\\r\\n]+;
`;

// the nonterminals of the grammar
enum ExpressionGrammar {
    Expression, Resize, Primitive, TopToBottomOperator, Filename, Number, Whitespace, Caption, Overlay, GlueSide, Underscore
}

// compile the grammar into a parser
const parser: Parser<ExpressionGrammar> = compile(grammar, ExpressionGrammar, ExpressionGrammar.Expression);

/**
 * Parse a string into an expression.
 * 
 * @param input string to parse
 * @returns Expression parsed from the string
 * @throws ParseError if the string doesn't match the Expression grammar
 */
export function parseExpression(input: string): Expression {
    // parse the example into a parse tree
    const parseTree: ParseTree<ExpressionGrammar> = parser.parse(input);

    // display the parse tree in various ways, for debugging only
    // console.log("parse tree:\n" + parseTree);
    // console.log(visualizeAsUrl(parseTree, ExpressionGrammar));

    // make an AST from the parse tree
    const expression: Expression = makeAbstractSyntaxTree(parseTree);
    // console.log("abstract syntax tree:\n" + expression);

    return expression;
}

/**
 * Convert a parse tree into an abstract syntax tree.
 * 
 * @param parseTree constructed according to the grammar for image meme expressions
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree: ParseTree<ExpressionGrammar>): Expression {

    if (parseTree.name === ExpressionGrammar.Expression) {
        // expression ::= glueside (topToBottomOperator glueside)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.GlueSide);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((prev, cur) => new GlueTopBottom(prev, cur));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.GlueSide) {
        // glueside ::= underscore ('|' underscore)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Underscore);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((prev, cur) => new GlueSide(prev, cur));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Underscore) {
        // underscore ::= overlay ('_' overlay)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Overlay);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((prev, cur) => new Underscore(prev, cur));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Overlay) {
        // overlay ::= resize ('^' resize)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Resize);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((prev, cur) => new TopOverlay(prev, cur));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Resize) {
        // resize ::= primitive ('@' number 'x' number)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.children;
        let expression: Expression = makeAbstractSyntaxTree(children[0] ?? assert.fail("missing child"));

        // For every two children, they make a Dimension object. (A Dimension requires two numbers, which is why it requires two children per object)
        for (let i = 1; i < Math.floor(children.length / 2) + 1; ++i) {
            const width: string = (children[2 * i - 1] ?? assert.fail("missing number")).text;
            const height: string = (children[2 * i] ?? assert.fail("missing number")).text;

            let ratio: number;

            if (width === "?" && height === "?") {
                throw new Error("Invalid Dimensions. \"?x?\" was passed in to the parse");
            } else if (width == "?" || height === "?") {
                ratio = expression.size().getWidth() / expression.size().getHeight();
            } else {
                ratio = Number(width) / Number(height);
            }

            expression = new Resize(expression, new Dimension(width, height, ratio));

        }
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Primitive) {
        // primitive ::= filename | caption | '(' expression ')';
        const child: ParseTree<ExpressionGrammar> = parseTree.children[0] ?? assert.fail("missing child");
        if (child.name === ExpressionGrammar.Filename || child.name === ExpressionGrammar.Caption || child.name === ExpressionGrammar.Expression) {
            return makeAbstractSyntaxTree(child);
        } else {
            assert.fail(`Primitive node unexpected child ${ExpressionGrammar[child.name]}`);
        }

    } else if (parseTree.name === ExpressionGrammar.Filename) {
        // filename ::= [A-Za-z0-9./][A-Za-z0-9./_-]*;

        const name: string = parseTree.text;
        return new Filename(name);

    } else if (parseTree.name === ExpressionGrammar.Caption) {
        // caption ::= [A-Za-z ]*;

        const caption: string = parseTree.text;
        return new Caption(caption);
    }

    else {
        assert.fail(`cannot make AST for ${ExpressionGrammar[parseTree.name]} node`);
    }
}

/**
 * Main function. Parses and then reprints an example expression.
 */
function main(): void {
    // const input = "foo_bar.png|baz-qux.jpg";
    const input = "\"testing testing\"";
    console.log(input);
    const expression = parseExpression(input);
    console.log(expression);
}

if (require.main === module) {
    main();
}
