/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import * as parserlib from 'parserlib';
import { Canvas, Image, createCanvas, addImageFromFile, getImage } from '../src/image-library';
import { Expression, Filename, Caption, Resize, Dimension, parse, GlueSide } from '../src/Expression';

for (const imagename of [
    'boromir.jpg',
    'tech1.png', 'tech2.png', 'tech3.png', 'tech4.png', 'tech5.png', 'tech6.png',
    'blue.png', 'red.png', 'black.png', 'white.png',
    // if you depend on additional images in your tests, add them here
    // keep image files small to ensure Didit can build your repo
]) {
    addImageFromFile(`img/${imagename}`);
}

// function that converts text to an image that I stole straight from example.ts
function convertStringToImage(str: string): Canvas {
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


/**
 * Tests for the Expression abstract data type.
 */
describe("Expression", function () {

    //  Testing strategy
    //    
    // 
    //  toString():
    //      partition on type: Filename, Caption, Resize, Overlay, Underscore, GlueTopBottom    
    //      partition on number of operators: 0, 1, >1
    //
    //  
    //  equalValue():
    //      parition on type: Filename, Caption, Resize, Overlay, Underscore, GlueTopBottom   
    //      partition on order: same order, different order
    //      partition on result: equal, not equal
    //      partition on number of operators: 0, 1, >1
    //
    //
    //  size():
    //      partition on type: Filename, Caption, Resize, Overlay, Underscore, GlueTopBottom   
    //      partition on number of operators: 0, 1, >1
    //      
    //  
    //  image():
    //      partition on type: Filename, Caption, Resize, Overlay, Underscore, GlueTopBottom   
    //      partition on number of operators: 0, 1, >1


    it("parserlib needs to be version 3.2.x", function () {
        assert(parserlib.VERSION.startsWith("3.2"));
    });


    // toString()
    it("Filename has correct toString()", function () {
        const name = "123.jpg";
        const ast = parse(name);
        assert(ast.toString() === name, "expected same file name string");
    });

    it("Caption has correct toString()", function () {
        const name = "\"caption test\"";
        const ast = parse(name);
        assert(ast.toString() === name, "expected same caption text string");
    });

    it("Resize has correct toString()", function () {
        const ast = parse("test.png @ 500x500");
        assert(ast.toString() === "(test.png @ 500x500)", "expected correctly formatted Resize operation");
    });

    it("GlueSide has correct toString()", function () {
        const ast = parse("test.png | \"caption here\"");
        assert(ast.toString() === "(test.png | \"caption here\")");
    });

    it("Using a GlueSide with parentheses then Resize operator should have correct toString()", function () {
        const ast = parse("(test.png | ll.jpg) @ 400x500");
        assert(ast.toString() === "((test.png | ll.jpg) @ 400x500)");
    });

    it("Using a GlueSide then Resize with parentheses should have correct toString()", function () {
        const ast = parse("test.png | (ll.jpg @ 500x600)");
        assert(ast.toString() === "(test.png | (ll.jpg @ 500x600))");
    });

    it("Overlay has the correct toString()", function () {
        const ast = parse("test.png ^ pp.jpg");
        assert(ast.toString() === "(test.png ^ pp.jpg)");
    });

    it("Using a GlueSide then Overlay has the correct toString()", function () {
        const ast = parse("test.png | a.jpg ^ gg.gif");
        assert(ast.toString() === "(test.png | (a.jpg ^ gg.gif))");
    });

    it("Using a GlueSide with parentheses then Overlay has the correct toString()", function () {
        const ast = parse("(test.png | a.jpg) ^ gg.gif");
        assert(ast.toString() === "((test.png | a.jpg) ^ gg.gif)");
    });

    it("Using an Overlay with parentheses then a resize has the correct toString()", function () {
        const ast = parse("(aa.png ^ \"bb.png\") @ 200x500");
        assert(ast.toString() === "((aa.png ^ \"bb.png\") @ 200x500)");
    });

    it("Using an Underscore has the correct toString()", function () {
        const ast = parse("test.pp _ b.aa");
        assert(ast.toString() === "(test.pp _ b.aa)");
    });

    it("Using a GlueTopBottom has the correct toString()", function () {
        const ast = parse("g.a ----- l.l");
        assert(ast.toString() === "(g.a --- l.l)");
    });

    it("Using a Resize with a '?' as the height has the correct toString()", function () {
        const ast = parse("tech1.png @ 300x?");
        assert(ast.toString() === "(tech1.png @ 300x?)");
    });

    it("Using an Underscore, GlueTopBottom, and a Resize with '?' together (in this order) should have correct toString()", function () {
        const ast = parse("a.a _ b.b --- tech2.png @ 456x?");
        assert(ast.toString() === "((a.a _ b.b) --- (tech2.png @ 456x?))");
    });


    // equalValue()
    it("Filename should be equal to same input string", function () {
        assert(parse("test.jpg").equalValue(parse("test.jpg")), "expected two filenames of same input strin to be equal");
    });

    it("Filename should be not equal to different input strings", function () {
        assert(!parse("test.jpg").equalValue(parse("test.png")), "expected two filenames with different input strings to be not equal");
    });

    it("Caption should be equal to same input string", function () {
        assert(parse("\"this is test\"").equalValue(parse("\"this is test\"")), "expected two captions with same input strings to be equal");
    });

    it("Caption should be not equal to different input strings", function () {
        assert(!parse("\"this test\"").equalValue(parse("\"not test\"")), "expected two captions to be not equal with different input strings");
    });

    it("Reisze should be equal to own toString()", function () {
        const ast = parse("test.png @ 500x500");
        assert(ast.equalValue(parse(ast.toString())), "expected equal value after parsing own toString()");
    });

    it("Resize should not be equal to different input strings", function () {
        const ast = parse("test.png @ 500x600");
        assert(!ast.equalValue(parse("test.jpg @ 500x600")));
    });

    it("GlueSide with parentheses and Resize operator should be equal after own toString()", function () {
        const ast = parse("(test.jpg | ll.png) @ 300x200");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("GlueSide and Resize operator should be equal after own toString()", function () {
        const ast = parse("test.png | ll.png @ 400x230");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("GlueSide and Resize operator with parentheses should be equal after own toString()", function () {
        const ast = parse("banana.jpg | (tt.png @ 900x21)");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Overlay should be equal to its own input string", function () {
        const input = "gg.png ^ \"help\"";
        const ast = parse(input);
        assert(ast.equalValue(parse(input)));
    });

    it("Overlay operator should be equal after parsing own toString()", function () {
        const ast = parse("\"yep\" ^ \"nope\"");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Resize + Overlay + GlueSide operator should be equal after parsing own toString()", function () {
        const ast = parse("f.a ^ b.a @ 100x50 | c.c");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Using Underscore operator should be equal after parsing own toString()", function () {
        const ast = parse("f.a _ b.c");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Using a GlueTopBottom should be equal after parsing own toString()", function () {
        const ast = parse("a.a ---- b.b");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Using a Resize with a '?' should be equal after parsing own toString()", function () {
        const ast = parse("tech1.png @ 100x?");
        assert(ast.equalValue(parse(ast.toString())));
    });

    it("Using an Underscore, GlueTopBottom, and a Resize with '?' together (in this order) should be equal after parsing own toString()", function () {
        const ast = parse("a.a _ b.b --- tech2.png @ ?x63");
        assert(ast.equalValue(parse(ast.toString())));
    });


    // size():
    it("Single Filename (no operators) should be their own size", function () {
        const name = "tech1.png";
        const size = parse(name).size();

        const image = getImage(name);
        const width = image.width;
        const height = image.height;

        assert(size.getWidth() === width && size.getHeight() === height);
    });

    it("Single Captions (no operators) should be their own size", function () {
        const input = "\"test banana\"";
        const size = parse(input).size();

        const image = convertStringToImage("test banana");
        const width = image.width;
        const height = image.height;

        assert(size.getWidth() === width && size.getHeight() === height);
    });


    it("Single Resize should have that as the new size be the size", function () {
        const input = "test.jpg @ 200x400";
        const expression = parse(input);
        const size = expression.size();
        assert(size.getWidth() === 200 && size.getHeight() === 400);
    });

    it("Two Resizes should be the size of the second dimension passed in", function () {
        const input = "\"banana banana\" @ 200x300 @ 900x1100";
        const expression = parse(input);
        const size = expression.size();
        assert(size.getWidth() === 900 && size.getHeight() === 1100);
    });

    it("Single GlueSide should have correct size", function () {
        const input = "tech3.png | tech4.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("tech3.png");
        const image2 = getImage("tech4.png");
        assert(size.getWidth() === image1.width + image2.width && size.getHeight() === Math.max(image1.height, image2.height));
    });

    it("Two Gluesides should have correct size", function () {
        const input = "tech3.png | tech4.png | tech5.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("tech3.png");
        const image2 = getImage("tech4.png");
        const image3 = getImage("tech5.png");
        assert(size.getWidth() === image1.width + image2.width + image3.width
            && size.getHeight() === Math.max(image1.height, image2.height, image3.height));
    });

    it("Combining a GlueSide and Resize (in this order) should have the right size", function () {
        const input = "(tech3.png | tech4.png) @ 300x400";
        const expression = parse(input);
        const size = expression.size();

        assert(size.getWidth() === 300 && size.getHeight() === 400);
    });

    it("Combining a Resize and Glueside (in this order) should have the right size", function () {
        const input = "tech4.png | (tech5.png @ 500x600)";
        const expression = parse(input);
        const size = expression.size();

        const image = getImage("tech4.png");
        assert(size.getWidth() === image.width + 500 && size.getHeight() == Math.max(image.height, 600));
    });

    it("Single Overlay should have the correct size", function () {
        const input = "tech4.png ^ tech3.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("tech4.png");
        const image2 = getImage("tech3.png");

        assert(size.getWidth() === Math.max(image1.width, image2.width) && size.getHeight() === Math.max(image1.height, image2.height));
    });

    it("Combining an GlueSide and a Resize and a Overlay (in this order) should have the correct size", function () {
        const input = "blue.png | boromir.jpg @ 200x500 ^ tech6.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("blue.png");
        const image2 = getImage("tech6.png");

        assert(size.getWidth() === image1.width + Math.max(200, image2.width) && size.getHeight() === Math.max(image1.height, 500, image2.height));
    });

    it("Combining an (GlueSide and a Resize) and a Overlay (parentheses included) should have the correct size", function () {
        const input = "(blue.png | boromir.jpg @ 1x1) ^ tech6.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("blue.png");
        const image2 = getImage("tech6.png");
        assert(size.getWidth() === Math.max(image1.width + 1, image2.width) && size.getHeight() === Math.max(image1.height, 1, image2.height));
    });

    it("Single Underscore operator should be its own size", function () {
        const input = "red.png _ tech1.png";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("red.png");
        const image2 = getImage("tech1.png");
        assert(size.getWidth() === Math.max(image1.width, image2.width) && size.getHeight() === Math.max(image1.height, image2.height));
    });

    it("Single GlueTopBottom operator should be its own size", function () {
        const input = "black.png --- boromir.jpg";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("black.png");
        const image2 = getImage("boromir.jpg");
        assert(size.getWidth() === Math.max(image1.width, image2.width) && size.getHeight() === image1.height + image2.height);
    });

    it("Single Resize with '?' should have the correct sizing", function () {
        const input = "tech3.png @ 50x?";
        const expression = parse(input);
        const size = expression.size();

        const image = getImage("tech3.png");
        assert((size.getWidth() === 50) && (size.getHeight() === Math.round(50 * (image.height / image.width))));
    });

    it("Combining an Underscore, GlueTopBottom, and a Resize with '?' together (in this order) should have correct sizing", function () {
        const input = "tech6.png _ red.png --- tech4.png @ 321x?";
        const expression = parse(input);
        const size = expression.size();

        const image1 = getImage("tech6.png");
        const image2 = getImage("red.png");
        const image3 = getImage("tech4.png");
        const image3Height: number = Math.round(321 * (image3.height / image3.width));

        const realWidth: number = Math.max(image1.width, image2.width, 321);
        const realHeight: number = Math.max(image1.height, image2.height) + image3Height;

        assert((size.getWidth() === realWidth && size.getHeight() === realHeight));
    });


    // image():
    it("a single Filename should have the correct image", function () {
        // from calling image()
        const input = "tech4.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("tech4.png");
        const context2 = createCanvas(image2.width, image2.height).getContext('2d');
        context2.drawImage(image2, 0, 0, image2.width, image2.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, image2.width, image2.height).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("a single caption should have the correct image", function () {
        // from calling image()
        const input = "\"testing test\"";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2: Canvas = convertStringToImage("testing test");
        const context2 = image2.getContext('2d');

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, image2.width, image2.height).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("GlueSide operator should generate the correct image", function () {
        // from calling image()
        const input = "tech1.png | tech2.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("tech1.png");
        const image3 = getImage("tech2.png");
        const canvasWidth = image2.width + image3.width;
        const canvasHeight = Math.max(image2.height, image3.height);
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, 0, (canvasHeight - image2.height) / 2, image2.width, image2.height);
        context2.drawImage(image3, image2.width, (canvasHeight - image3.height) / 2, image3.width, image3.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("Resize should generate the correct image", function () {
        // from calling image()
        const input = "tech1.png @ 200x150"; // "200x150" is the exact same dimensions as the original image as I have no clue how 'canvas' scales their images
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("tech1.png");
        const context2 = createCanvas(image2.width, image2.height).getContext('2d');
        context2.drawImage(image2, 0, 0, image2.width, image2.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, image2.width, image2.height).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("2 GlueSide operators should generate the correct image", function () {
        // from calling image()
        const input = "tech4.png | tech3.png | tech5.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("tech4.png");
        const image3 = getImage("tech3.png");
        const image4 = getImage("tech5.png");
        const canvasWidth = image2.width + image3.width + image4.width;
        const canvasHeight = Math.max(image2.height, image3.height, image4.height);
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, 0, (canvasHeight - image2.height) / 2, image2.width, image2.height);
        context2.drawImage(image3, image2.width, (canvasHeight - image3.height) / 2, image3.width, image3.height);
        context2.drawImage(image4, image2.width + image3.width, (canvasHeight - image4.height) / 2, image4.width, image4.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("Overlay operators should generate the correct image", function () {
        // from calling image
        const input = "\"yeppers\" ^ tech1.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = convertStringToImage("yeppers");
        const image3 = getImage("tech1.png");
        const canvasWidth = Math.max(image2.width, image3.width);
        const canvasHeight = Math.max(image2.height, image3.height);
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, (canvasWidth - image2.width) / 2, 0, image2.width, image2.height);
        context2.drawImage(image3, (canvasWidth - image3.width) / 2, 0, image3.width, image3.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("combining a GlueSide and Resize and a Overlay operator should create the correct image", function () {
        // from calling image
        const input = "\"nope\" | tech1.png @ 200x150 ^ tech2.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = convertStringToImage("nope");
        const image3 = getImage("tech1.png");
        const image4 = getImage("tech2.png");
        const canvasWidth = image2.width + Math.max(200, image4.width);
        const canvasHeight = Math.max(image2.height, 150, image4.height);
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        // draws "nope";
        context2.drawImage(image2, 0, (canvasHeight - image2.height) / 2, image2.width, image2.height);
        // draws tech1.png @ 200x150 (weird math with dividing by 2 is to center picture after operations)
        context2.drawImage(image3, image2.width + (Math.max(200, image4.width) - image3.width) / 2,
            (canvasHeight - Math.max(150, image4.height)) / 2, image3.width, image3.height);
        // draws tech2.png
        context2.drawImage(image4, image2.width + (Math.max(200, image4.width) - image4.width) / 2,
            (canvasHeight - Math.max(150, image4.height)) / 2, image4.width, image4.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("A single Underscore operator should have the correct image", function () {
        // from calling image
        const input = "tech2.png _ \"yes no\"";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("tech2.png");
        const image3 = convertStringToImage("yes no");
        const canvasWidth = Math.max(image2.width, image3.width);
        const canvasHeight = Math.max(image2.height, image3.height);
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, (canvasWidth - image2.width) / 2, 0, image2.width, image2.height);
        context2.drawImage(image3, (canvasWidth - image3.width) / 2, canvasHeight - image3.height, image3.width, image3.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("A single GlueTopBottom operator should have the correct image", function () {
        // from calling image
        const input = "blue.png --- white.png";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("blue.png");
        const image3 = getImage("white.png");
        const canvasWidth = Math.max(image2.width, image3.width);
        const canvasHeight = image2.height + image3.height;
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, (canvasWidth - image2.width) / 2, 0, image2.width, image2.height);
        context2.drawImage(image3, (canvasWidth - image3.width) / 2, image2.height, image3.width, image3.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("A single Resize operator with a '?' should have the correct image", function () {
        // from calling image
        const input = "blue.png @ ?x30";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = getImage("blue.png");
        const context2 = createCanvas(image2.width, image2.height).getContext('2d');
        context2.drawImage(image2, 0, 0, image2.width, image2.height);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, image2.width, image2.height).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });

    it("Having Underscore, GlueTopBottom, and a Resize with '?' together (in this order) should have the correct image", function () {
        // from calling image
        const input = "\"words here\" _ tech3.png --- red.png @ ?x60";
        const expression = parse(input);
        const image1 = expression.image();
        const context1 = image1.getContext('2d');

        // from manually drawing an image
        const image2 = convertStringToImage("words here");
        const image3 = getImage("tech3.png");
        const image4 = getImage("red.png");
        const canvasWidth: number = Math.max(image2.width, image3.width, 60);
        const canvasHeight: number = Math.max(image2.height, image3.height) + 60;
        const context2 = createCanvas(canvasWidth, canvasHeight).getContext('2d');
        context2.drawImage(image2, (canvasWidth - image2.width) / 2, Math.max(image2.height, image3.height) - image2.height, image2.width, image2.height);
        context2.drawImage(image3, (canvasWidth - image3.width) / 2, Math.max(image2.height, image3.height) - image3.height, image3.width, image3.height);
        context2.drawImage(image4, (canvasWidth - 60) / 2, Math.max(image2.height, image3.height), 60, 60);

        const pixelsFromFunction: Uint8ClampedArray = context1.getImageData(0, 0, image1.width, image1.height).data;
        const pixelsFromManual: Uint8ClampedArray = context2.getImageData(0, 0, canvasWidth, canvasHeight).data;

        assert.deepStrictEqual([...pixelsFromFunction], [...pixelsFromManual], "expected all the pixels to be the same color");
    });
});



/**
 * Tests for Dimension data type
 */

describe("Dimension", function () {
    // *** because of the way I designed Dimension, you can't parse a single Dimension by itself ***
    // *** you must call a new Dimension to test it ***


    //  Testing strategy
    //  
    //
    //  toString():
    //      partition on unknown values: has "?", doesn't have "?"
    //
    //
    //  equalValue():
    //      partition on unknown values: has "?", doesn't have "?"
    //      partition on equality: deep equal (same raw inputs), shallow equal (same abstract value only), not equal
    //      partition on order of width and height: same order, different order


    // toString()
    it("input doesn\'t have a ? value", function () {
        const width = "200";
        const height = "300";
        const ratio = 2 / 3;
        const ast = new Dimension(width, height, ratio);
        assert(ast.toString() === "200x300");
    });

    it("input does have a ? value", function () {
        const width = "300";
        const height = "?";
        const ratio = 3 / 4;
        const ast = new Dimension(width, height, ratio);
        assert(ast.toString() === "300x?");
    });



    // equalValue()
    it("input doesn\'t have a ? value, testing for deep equal, same order", function () {
        const width = "200";
        const height = "300";
        const ratio = 2 / 3;
        const ast = new Dimension(width, height, ratio);
        assert(ast.equalValue(new Dimension(width, height, ratio)), "expected using the same input value would create equal Dimensions");
    });

    it("input doesn\'t have a ? value, testing for no equal, different order", function () {
        const width = "300";
        const height = "400";
        const ratio = 3 / 4;
        const ast = new Dimension(width, height, ratio);
        assert(!ast.equalValue(new Dimension(height, width, 4 / 3)), "expected non equal Dimensions after swapping 'width' and 'height' order");
    });

    it("input has a ? value, testing for deep equal, same order", function () {
        const width = "200";
        const height = "?";
        const ratio = 2 / 3;
        const ast = new Dimension(width, height, ratio);
        assert(ast.equalValue(new Dimension(width, height, ratio)), "expected equal as same input structure");
    });

    it("input has a ? value, testing for shallow equal, same order", function () {
        const width = "?";
        const height = "300";
        const ratio = 4 / 3;
        const ast = new Dimension(width, height, ratio);
        assert(!ast.equalValue(new Dimension("400", "300", ratio)), "expected not equal as their raw input structure aren't the same");
    });

    it("input has a ? value, testing for shallow equal (with another ? value), same order", function () {
        const width = "?";
        const height = "300";
        const ratio = 1;
        const ast = new Dimension(width, height, ratio);
        assert(!ast.equalValue(new Dimension("300", "?", 1)), "expected not equal as structures aren't the same");
    });

    it("input has a ? value, testing for no equal, different order", function () {
        const width = "500";
        const height = "?";
        const ratio = 5 / 6;
        const ast = new Dimension(width, height, ratio);
        assert(!ast.equalValue(new Dimension("?", "500", 6 / 5)), "expected not equal as orders are swapped");
    });

});



describe("parse", function () {

    //  Testing Strategy
    //  
    //  partition on operators: none, |, @, a mix of many
    //  partition on number of operators: 0, 1, >1
    //  partition on primitives: filenames only, captions only, mix of filenames and captions, other expressions


    it("parse has no operators, filenames only", function () {
        const input = "foo_bar.jpg";
        const file = new Filename(input);
        assert(parse(input).equalValue(file), "expected the parse and manually init values to be equal");
        assert(file.equalValue(parse(file.toString())), "expected toString() invariant to hold");
    });

    it("parse has no operators, captions only", function () {
        const input = "\"testing testing\"";
        const caption = new Caption("testing testing");
        assert(parse(input).equalValue(caption), "expected the parse and manually init values to be equal");
        assert(caption.equalValue(parse(caption.toString())), "expected toString() invariant to hold");
    });

    it("parse has 1 | operator, both operands are filenames", function () {
        const input = "foo_bar.jpg | beep.png";
        const expression = new GlueSide(new Filename("foo_bar.jpg"), new Filename("beep.png"));
        assert(parse(input).equalValue(expression), "expected the parse and manually init values to be equal");
        assert(expression.equalValue(parse(expression.toString())), "expected toString() invariant to hold");
    });

    it("parse has 2 @ operator", function () {
        const input = "foo.jpg @ 100x200 @ 300x400";
        const expression = new Resize(new Resize(new Filename("foo.jpg"), new Dimension("100", "200", 1 / 2)), new Dimension("300", "400", 3 / 4));
        assert(parse(input).equalValue(expression), "expected the parse and manually init values to be equal");
        assert(expression.equalValue(parse(expression.toString())), "expected toString() invariant to hold");
    });

    it("parse has a mix of 2 | operator and 1 @ operator, having a mix of filename and caption operands", function () {
        const input = "foo.jpg @ 100x200 | \"happy birthday\"";
        const expression = new GlueSide(new Resize(new Filename("foo.jpg"), new Dimension("100", "200", 1 / 2)), new Caption("happy birthday"));
        assert(parse(input).equalValue(expression), "expected the parse and manually init values to be equal");
        assert(expression.equalValue(parse(expression.toString())), "expected toString() invariant to hold");
    });

    // I sorta incorporated the 'parse' test cases into the 'toString()' and 'equalValue()' test cases above for future iterations
});