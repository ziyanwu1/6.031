/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { parseExpression } from './ExpressionParser';
import { Canvas, Image, createCanvas, getImage } from './image-library';

/**
 * An immutable data type representing an image expression, as defined
 * in the PS3 handout.
 * 
 * PS3 instructions: this is a required ADT interface.
 * You MUST NOT change its name or the names or type signatures of existing methods or functions.
 * You may, however, add additional methods or classes, or strengthen the specs of existing methods.
 */
export interface Expression {
    // Data type definition
    //      Expression = Filename + Caption + Operator(left: Expression, rest: Expression) + Resize(left: Expression, right: Dimension)
    //      
    //      'Operator' represents the operations that can be done to images (Glue Side, Glue Top Bottom, Top Overlay, Bottom Overlay, Resize)

    /**
     * @returns a parsable representation of this expression, such that
     *          for all e:Expression, e.equalValue(Expression.parse(e.toString()))
     */
    toString(): string;

    /**
     * @param that any Expression
     * @returns true if and only if this and that are structurally-equal
     *          Expressions, as defined in the PS3 handout
     */
    equalValue(that: Expression): boolean;

    /**
     * @returns the dimensions of the Expression
     */
    size(): Dimension;

    /**
     * @returns the image represented by the Expression
     */
    image(): Canvas;


}


/**
 * An immutable data type representing an image file
 */
export class Filename implements Expression {

    private readonly object: string;

    //  Rep Invariant:
    //      true
    //  Abstraction Function:
    //      AF(object) = an image whose file has the name "object"
    //  Safety from Rep Exposure:
    //      'object' is private and readonly
    //      we have no mutator methods 

    /**
     * Make a Filename
     * 
     * @param object  is the string that represent the file's name
     */
    public constructor(object: string) {
        this.object = object;
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return this.object;
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof Filename)) { return false; }
        return this.object === that.object;
    }

    /** @inheritdoc */
    public size(): Dimension {
        const image = getImage(this.object);
        this.checkRep();
        return new Dimension(image.width.toString(), image.height.toString(), image.width / image.height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const image = getImage(this.object);
        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = image.width;
        const outputImageHeight = image.height;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');
        context.drawImage(image, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);

        this.checkRep();
        return canvas;
    }
}



/**
 * An immutable data type representing a text caption
 */
export class Caption implements Expression {

    private readonly object: string;

    //  Rep Invariant:
    //      true
    //  Abstraction Function:
    //      AF(object) = a meme caption with the text "object";
    //  Safety from Rep Exposure:
    //      'object' is private and readonly
    //      we have no mutator methods

    /**
     * Make a Caption
     * 
     * @param object  is the name of the text of our caption
     */
    public constructor(object: string) {
        this.object = object;
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return '"' + this.object + '"';
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof Caption)) { return false; }
        return this.object === that.object;
    }

    /**
     * this converts a caption text string to an image
     * (I took this straight from examples.ts)
     * 
     * @param str  the caption text we want to make an image of
     * @returns  a canvas with the text image in it
     */
    private convertStringToImage(str: string): Canvas {
        const font = '96pt bold';

        // make a tiny 1x1 image at first so that we can get a Graphics object, 
        // which we need to compute the width and height of the text
        const measuringContext = createCanvas(1, 1).getContext('2d');
        measuringContext.font = font;
        const fontMetrics = measuringContext.measureText(str);
        // console.log('metrics', fontMetrics);

        // now make a canvas sized to fit the text
        const canvas = createCanvas(fontMetrics.width, fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent);
        const context = canvas.getContext('2d');

        context.font = font;
        context.fillStyle = 'white';
        context.fillText(str, 0, fontMetrics.actualBoundingBoxAscent);

        context.strokeStyle = 'black';
        context.strokeText(str, 0, fontMetrics.actualBoundingBoxAscent);

        return canvas;
    }

    /** @inheritdoc */
    public size(): Dimension {
        const caption = this.convertStringToImage(this.object);
        this.checkRep();
        return new Dimension(caption.width.toString(), caption.height.toString(), caption.width / caption.height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const caption = this.convertStringToImage(this.object);
        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = caption.width;
        const outputImageHeight = caption.height;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');
        context.drawImage(caption, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);

        this.checkRep();
        return canvas;
    }
}


/**
 * An abstract template that defines the basis for all standard operators between two Expressions
 */
abstract class Operator implements Expression {

    protected readonly left: Expression;
    protected readonly right: Expression;

    // Base constructor to initializing an Operator
    public constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }

    /**
     * @inheritdoc
     */
    public abstract toString(): string;

    /**
     * @inheritdoc
     */
    public abstract equalValue(that: Expression): boolean;

    /**
     * @inheritdoc
     */
    public abstract size(): Dimension;

    /**
     * @inheritdoc
     */
    public abstract image(): Canvas;

}


/** Represents the side-to-side glue operator of two Expression images */
export class GlueSide extends Operator {
    //  symbol for this is "|" 

    //  Rep Invariant:
    //      true;
    //  Abstraction Function:
    //      AF(left, right) = the image after applying glue side-to-side to both the 'left' and 'right' images 
    //  Safety from Rep Exposure:
    //      'left' and 'right' are both protected readonly
    //      we have no mutator methods

    /**
     * Make a GlueSide
     * 
     * @param left  is the expression to the left of the operator
     * @param right  is the expression to the right of the operator
     */
    public constructor(left: Expression, right: Expression) {
        super(left, right);
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return "(" + this.left.toString() + " | " + this.right.toString() + ")";
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof GlueSide)) { return false; }
        return (this.left.equalValue(that.left)) && (this.right.equalValue(that.right));
    }

    /** @inheritdoc */
    public size(): Dimension {
        const width: number = this.left.size().getWidth() + this.right.size().getWidth();
        const height: number = Math.max(this.left.size().getHeight(), this.right.size().getHeight());
        this.checkRep();
        return new Dimension(width.toString(), height.toString(), width / height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const outputImageWidth = this.left.size().getWidth() + this.right.size().getWidth();
        const outputImageHeight = Math.max(this.left.size().getHeight(), this.right.size().getHeight());

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        const leftImage = this.left.image();
        const leftUpperLeftX = 0;
        const leftUpperLeftY = (outputImageHeight - leftImage.height) / 2; // allows for proper centering vertically

        const rightImage = this.right.image();
        const rightUpperLeftX = leftImage.width;
        const rightUpperLeftY = (outputImageHeight - rightImage.height) / 2;

        context.drawImage(leftImage, leftUpperLeftX, leftUpperLeftY, leftImage.width, leftImage.height);
        context.drawImage(rightImage, rightUpperLeftX, rightUpperLeftY, rightImage.width, rightImage.height);

        this.checkRep();
        return canvas;
    }
}



/** Represents the top overlay operator on two Expression images */
export class TopOverlay extends Operator {
    //  symbol for this is "^"

    //  Rep Invariant:
    //      true
    //  Abstraction Function:
    //      AF(left, right) = the image after applying a top overlay from the 'right' image go on top of the 'left' image  
    //  Safety from Rep Exposure:
    //      'left' and 'right' are both protected readonly
    //      we have no mutator methods

    /**
     * Make an Top Overlay
     * 
     * @param left  is the expression to the left of the operator
     * @param right  is the expression to the right of the operator
     */
    public constructor(left: Expression, right: Expression) {
        super(left, right);
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return '(' + this.left.toString() + " ^ " + this.right.toString() + ")";
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof TopOverlay)) { return false; }
        return (this.left.equalValue(that.left) && this.right.equalValue(that.right));
    }

    /** @inheritdoc */
    public size(): Dimension {
        const width: number = Math.max(this.left.size().getWidth(), this.right.size().getWidth());
        const height: number = Math.max(this.left.size().getHeight(), this.right.size().getHeight());
        this.checkRep();
        return new Dimension(width.toString(), height.toString(), width / height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const outputImageWidth: number = Math.max(this.left.size().getWidth(), this.right.size().getWidth());
        const outputImageHeight: number = Math.max(this.left.size().getHeight(), this.right.size().getHeight());

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        const leftImage = this.left.image();
        const leftUpperLeftX = (outputImageWidth - leftImage.width) / 2; // allows for proper centering horizontally
        const leftUpperLeftY = 0;

        const rightImage = this.right.image();
        const rightUpperLeftX = (outputImageWidth - rightImage.width) / 2;
        const rightUpperLeftY = 0;

        context.drawImage(leftImage, leftUpperLeftX, leftUpperLeftY, leftImage.width, leftImage.height);
        context.drawImage(rightImage, rightUpperLeftX, rightUpperLeftY, rightImage.width, rightImage.height);

        this.checkRep();
        return canvas;
    }
}



/** Represents the bottom overlay operator between two Expression images */
export class Underscore extends Operator {
    // symbol for this is "_"

    //  Rep Invariant:
    //      true;
    //  Abstraction Function:
    //      AF(left, right) = the image after applying a bottom overlay from the 'right' image go on top of the 'left' image  
    //  Safety from Rep Exposure:
    //      'left' and 'right' are both protected readonly
    //      we have no mutator methods

    /**
     * Make an Underscore
     * 
     * @param left  is the expression to the left of the operator
     * @param right  is the expression to the right of the operator
     */
    public constructor(left: Expression, right: Expression) {
        super(left, right);
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return "(" + this.left.toString() + " _ " + this.right.toString() + ")";
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof Underscore)) { return false; }
        return (this.left.equalValue(that.left)) && (this.right.equalValue(that.right));
    }

    /** @inheritdoc */
    public size(): Dimension {
        const width: number = Math.max(this.left.size().getWidth(), this.right.size().getWidth());
        const height: number = Math.max(this.left.size().getHeight(), this.right.size().getHeight());
        this.checkRep();
        return new Dimension(width.toString(), height.toString(), width / height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const outputImageWidth: number = Math.max(this.left.size().getWidth(), this.right.size().getWidth());
        const outputImageHeight: number = Math.max(this.left.size().getHeight(), this.right.size().getHeight());

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        const leftImage = this.left.image();
        const leftUpperLeftX = (outputImageWidth - leftImage.width) / 2; // allows for proper centering horizontally
        const leftUpperLeftY = outputImageHeight - leftImage.height; // allows for proper vertical placement of elements

        const rightImage = this.right.image();
        const rightUpperLeftX = (outputImageWidth - rightImage.width) / 2;
        const rightUpperLeftY = outputImageHeight - rightImage.height;

        context.drawImage(leftImage, leftUpperLeftX, leftUpperLeftY, leftImage.width, leftImage.height);
        context.drawImage(rightImage, rightUpperLeftX, rightUpperLeftY, rightImage.width, rightImage.height);

        this.checkRep();
        return canvas;
    }

}



/** Represents the top-to-bottom glue operator between two Expression images */
export class GlueTopBottom extends Operator {
    // symbol for this is "---[-]*"

    //  Rep Invariant:
    //      true;
    //  Abstraction Function:
    //      AF(left,right) = the image represented by taking the 'left' and 'right' image glued together vertically
    //  Safety from Rep Exposure:
    //      'left' and 'right' are both protected readonly
    //      we have no mutator methods

    /**
     * Make a GlueTopBottom
     * 
     * @param left  is the expression to the left of the operator
     * @param right  is the expression to the right of the operator
     */
    public constructor(left: Expression, right: Expression) {
        super(left, right);
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return "(" + this.left.toString() + " --- " + this.right.toString() + ")";
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof GlueTopBottom)) { return false; }
        return (this.left.equalValue(that.left)) && (this.right.equalValue(that.right));
    }

    /** @inheritdoc */
    public size(): Dimension {
        const width: number = Math.max(this.left.size().getWidth(), this.right.size().getWidth());
        const height: number = this.left.size().getHeight() + this.right.size().getHeight();
        this.checkRep();
        return new Dimension(width.toString(), height.toString(), width / height);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const outputImageWidth = Math.max(this.left.size().getWidth(), this.right.size().getHeight());
        const outputImageHeight = this.left.size().getHeight() + this.right.size().getHeight();

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        const leftImage = this.left.image();
        const leftUpperLeftX = (outputImageWidth - leftImage.width) / 2; // allows for proper centering horizontally
        const leftUpperLeftY = 0;

        const rightImage = this.right.image();
        const rightUpperLeftX = (outputImageWidth - rightImage.width) / 2;
        const rightUpperLeftY = leftImage.height;

        context.drawImage(leftImage, leftUpperLeftX, leftUpperLeftY, leftImage.width, leftImage.height);
        context.drawImage(rightImage, rightUpperLeftX, rightUpperLeftY, rightImage.width, rightImage.height);

        this.checkRep();
        return canvas;
    }

}



/** An immutable data type that represents the Dimensions of an image */
export class Dimension {

    // keeps track of raw string for structual integrity check
    private readonly rawWidth: string;
    private readonly rawHeight: string;

    private readonly width: number;
    private readonly height: number;

    //  Rep Invariant:
    //      'width' and 'height' must always be a defined number
    //      'rawWidth' and 'rawHeight' must either be numbers or the '?' character (only one of them can be a '?' character)
    //  Abstration Function:
    //      AF(width, height, rawWidth, rawHeight) = a dimension size of 'width' x 'height' whose internal underlying structure is 'rawWidth' x 'rawHeight'
    //  Safety from Rep Exposure:
    //      all variables are private and readonly
    //      we have no mutator methods

    private checkRep(): void {
        assert(!isNaN(this.width) && !isNaN(this.height));
        assert(!isNaN(Number(this.rawWidth)) || this.rawWidth === '?');
        assert(!isNaN(Number(this.rawHeight)) || this.rawHeight === '?');
    }

    /**
     * Make a Dimension object
     * 
     * @param width     the width of the dimension 
     *                  width is either an integer or the '?' character (both width and height can not be "?" at the same time, however)
     * @param height    the height of the dimension
     *                  height is either an integer or the '?' character (both width and height can not be "?" at the same time, however)
     * @param aspectRatio   aspect ratio of the image from dividing width by height
     *                      for values of input without a '?' character, aspectRatio must be equal to 'width'/'height'
     */
    public constructor(width: string, height: string, aspectRatio: number) {

        this.rawWidth = width;
        this.rawHeight = height;

        this.width = Number(width);
        this.height = Number(height);

        if (width !== '?' && height !== '?') {
            if (this.width / this.height !== aspectRatio) {
                throw new Error("when given two numbers, aspectRatio doesn't match width / height");
            }
        }

        if (width === '?') {
            this.width = Math.round(this.height * aspectRatio);
        }
        if (height === '?') {
            this.height = Math.round(this.width / aspectRatio);
        }

        if (isNaN(this.width) || isNaN(this.height) || isNaN(aspectRatio)) {
            throw new Error("input string for Dimension didn't follow spec");
        }

        this.checkRep();
    }

    /**
     * @returns a string representation of our Dimension object
     */
    public toString(): string {
        this.checkRep();
        return this.rawWidth + "x" + this.rawHeight;
    }

    /**
     * tests for if two dimensions are structually equal
     * 
     * @param that  another Dimension object
     * @returns  whether or not two Dimensions are structurally equal 
     */
    public equalValue(that: Dimension): boolean {
        this.checkRep();
        return (this.rawWidth === that.rawWidth) && (this.rawHeight === that.rawHeight);
    }

    /**
     * @returns the width value of our Dimension object 
     */
    public getWidth(): number {
        this.checkRep();
        return this.width;
    }

    /**
     * @returns the height value of our Dimension object
     */
    public getHeight(): number {
        this.checkRep();
        return this.height;
    }
}



/** Represents the resize operator on an Expression given a Dimension */
export class Resize implements Expression {
    //  symbol for this is "@"

    private readonly left: Expression;
    private readonly right: Dimension;

    //  Rep Invariant:
    //      true
    //  Abstraction Function:
    //      AF(left, right) = the image 'left' with a new size of dimensions 'right' (can be potentially scaled or stretched)
    //  Safety from Rep Exposure:
    //      'left' and 'right are both private readonly
    //      we have no mutator methods

    /**
     * Make a Resize
     * 
     * @param left  is the expression to the left of the operator
     * @param right  is the dimension we want to resize to
     */
    public constructor(left: Expression, right: Dimension) {
        this.left = left;
        this.right = right;
        this.checkRep();
    }

    private checkRep(): void {
        assert(true);
    }

    /** @inheritdoc */
    public toString(): string {
        this.checkRep();
        return "(" + this.left.toString() + " @ " + this.right.toString() + ")";
    }

    /** @inheritdoc */
    public equalValue(that: Expression): boolean {
        this.checkRep();
        if (!(that instanceof Resize)) { return false; }
        return this.left.equalValue(that.left) && this.right.equalValue(that.right);
    }

    /** @inheritdoc */
    public size(): Dimension {
        this.checkRep();
        const realWidth = this.right.getWidth();
        const realHeight = this.right.getHeight();
        return new Dimension(realWidth.toString(), realHeight.toString(), realWidth / realHeight);
    }

    /** @inheritdoc */
    public image(): Canvas {
        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = this.right.getWidth();
        const outputImageHeight = this.right.getHeight();

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        const image = this.left.image();

        context.drawImage(image, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);

        this.checkRep();
        return canvas;
    }
}



/**
 * Parse an expression.
 * 
 * @param input expression to parse, as defined in the PS3 handout
 * @returns expression AST for the input
 * @throws Error if the expression is syntactically invalid
 */
export function parse(input: string): Expression {
    return parseExpression(input);
}
