/* Copyright (c) 2007-2022 MIT 6.102/6.031/6.005 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import fs from 'fs';
import open from 'open';
import { Turtle, DrawableTurtle, LineSegment, PenColor, Point } from './turtle';

const TOTAL_ANGLE_IN_CIRCLE = 360;
const STRAIGHT_ANGLE = 180;
const DEGREES_TO_RADIANS = Math.PI / STRAIGHT_ANGLE;
const RADIANS_TO_DEGREES = STRAIGHT_ANGLE / Math.PI;


/**
 * Draw a square, by repeating walk forward and turning right. 
 * 
 * @param turtle the turtle context
 * @param sideLength length of each side, must be >= 0
 */
export function drawSquare(turtle: Turtle, sideLength: number): void {
    const TOTAL_SIDES = 4;
    const ANGLE = 90;
    for (let i = 0; i < TOTAL_SIDES; i++) {
        turtle.forward(sideLength);
        turtle.turn(ANGLE);
    }
}

/**
 * Determine the length of a chord of a circle.
 * (There is a simple formula; derive it or look it up.)
 * 
 * @param radius radius of a circle, must be > 0
 * @param angle in radians, where 0 <= angle < Math.PI
 * @returns the length of the chord subtended by the given `angle` 
 *          in a circle of the given `radius`
 */
export function chordLength(radius: number, angle: number): number {
    return 2 * radius * Math.sin(angle / 2);
}

/**
 * Approximate a circle by drawing a many-sided regular polygon, 
 * using only left-hand turns, and restoring the turtle's 
 * original heading and position after the drawing is complete.
 * 
 * @param turtle the turtle context
 * @param radius radius of the circle circumscribed around the polygon, must be > 0
 * @param numSides number of sides of the polygon to draw, must be >= 10
 */
export function drawApproximateCircle(turtle: Turtle, radius: number, numSides: number): void {
    const angle: number = TOTAL_ANGLE_IN_CIRCLE / numSides;
    const sideLength: number = chordLength(radius, angle * DEGREES_TO_RADIANS);

    for (let i = 0; i < numSides; i++) {
        turtle.forward(sideLength);
        turtle.turn(-angle);
    }
}

/**
 * Calculate the distance between two points.
 * 
 * @param p1 one point
 * @param p2 another point
 * @returns Euclidean distance between p1 and p2
 */
export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/** 
 * gets the angle you need to turn to to get to the new point
 * 
 * @param currentDirection provides the vector direction the turtle is facing, array must be length 2
 * @param newDirection provides the vector direction the turtle needs to travel to get to the next point, array must be length 2
 * @returns the angle, in degrees, needed to turn to reach the new point
 */
export function turnAngle(currentDirection: Array<number>, newDirection: Array<number>): number {
    const currentX = currentDirection[0];
    const currentY = currentDirection[1];
    const newX = newDirection[0];
    const newY = newDirection[1];

    const firstAngle = Math.atan2(currentY, currentX);
    const secondAngle = Math.atan2(newY, newX);

    let out = (firstAngle - secondAngle) * RADIANS_TO_DEGREES;
    if (out < 0) {
        out = TOTAL_ANGLE_IN_CIRCLE + out;
    }
    return out;
}

/**
 * Given a list of points, find a sequence of turns and moves that visits the points in order.
 * 
 * @param points  array of N input points.  Adjacent points must be distinct, and the array must not start with (0,0).
 * @returns an array of length 2N+1 of the form [turn_0, move_0, ..., turn_N-1, move_N-1, turn_N]
 *    such that if the turtle starts at (0,0) heading up (positive y direction), 
 *    and executes turn(turn_i) and forward(move_i) actions in the same order, 
 *    then it will be at points[i] after move_i for all valid i,
 *    and be back to its original upward heading after turn_N.
 */
export function findPath(points: Array<Point>): Array<number> {
    const UP_UNIT_VECTOR = [0, 1];

    const out: Array<number> = [];
    let currentPoint: Point = new Point(0, 0);
    let currentVector: Array<number> = UP_UNIT_VECTOR;

    for (const point of points) {
        const newDirection: Array<number> = [point.x - currentPoint.x, point.y - currentPoint.y];
        const angle: number = turnAngle(currentVector, newDirection);
        const length: number = distance(currentPoint, point);

        out.push(angle);
        out.push(length);

        currentPoint = point;
        currentVector = newDirection;
    }

    out.push(turnAngle(currentVector, UP_UNIT_VECTOR));

    return out;
}


/**
 * Helper function to calculate points on the ellipse
 * 
 * @param center    location of the ellipse's center
 * @param major     radius of horizontal axis of ellipse
 * @param minor     radius of vertical axis of ellipse
 * @param x         x-coordinate of ellipse
 * @param positive  to get the point above or below the horizontal axis
 * 
 * @returns the corresponding y-coordinate to the given x-coordinate whose (x,y) point is on the ellipse
 */
export function ellipseEquation(center: Point, major: number, minor: number, x: number, positive: boolean): number {
    const EPSILON = 1e-7;  // this fixes a floating point subtraction bug

    const alpha: number = positive ? 1 : -1;
    return alpha * Math.sqrt((minor ** 2) * ((1 + EPSILON) - (x - center.x) ** 2 / (major ** 2))) + center.y;
}


/**
 * gets multiple coordinate points of the specified ellipse
 * 
 * @param center  location of the ellipse's center
 * @param width   length of horizontal axis of ellipse
 * @param height  length of vertical axis of ellipse
 * @param numPoints  the number of sample points of the ellipse we want
 * 
 * @returns an array of points that when read left to right connects the dots to make an ellipse
 */
export function getEllipsePoints(center: Point, width: number, height: number, numPoints: number): Array<Point> {

    const out: Array<Point> = [];

    // top half of the ellipse
    for (let i = 0; i < numPoints; i++) {
        const x: number = (center.x - (width / 2)) + width * (i / (numPoints - 1));
        out.push(new Point(x, ellipseEquation(center, width / 2, height / 2, x, true)));
    }

    // bottom half of the ellipse
    for (let j = numPoints - 2; j >= 0; j--) {
        const x: number = (center.x - width / 2) + width * (j / (numPoints - 1));
        out.push(new Point(x, ellipseEquation(center, width / 2, height / 2, x, false)));
    }

    return out;
}


/**
 * helper function that brings the turtle back to the origin
 * note: this resets the turtle's pen color to transparent
 * 
 * @param turtle           turtle context
 * @param currentPosition  is the current coordinates of the turtle
 */
export function backToOrigin(turtle: Turtle, currentPosition: Point): void {
    const path: Array<number> = findPath([currentPosition]); // length 3 array 
    const angle = -(STRAIGHT_ANGLE - path[0]); // complement of angle from (0,0) to current position
    turtle.color(PenColor.Transparent);
    turtle.turn(angle);
    turtle.forward(path[1]);
    turtle.turn(-angle);
}


/**
 * draws a shape
 * 
 * @param turtle  the turtle context
 * @param points  an array of points that we want to connect the dots of to draw
 * @param color   color of the line of the ellipse
 */
export function drawShape(turtle: Turtle, points: Array<Point>, color: PenColor): void {
    const instructions: Array<number> = findPath(points);

    for (let i = 0; i < instructions.length; i++) {
        if ((i % 2) === 0) {
            turtle.turn(instructions[i]);
        }
        else {
            if (i == 1) {
                // turtle moves from (0,0) to the first point
                turtle.color(PenColor.Transparent);
            }
            else {
                turtle.color(color);
            }

            turtle.forward(instructions[i]);
        }
    }

    backToOrigin(turtle, points[points.length - 1]);
}

/**
 * helper function to help calculate points on the spiral
 * denoted by the paramteric equation: r = coefficient * theta
 * 
 * @param coefficient  the scaling factor for the spiral, coefficient !== 0
 * @param theta  the angle, in radians, 
 * @returns a point in (x,y) coordinates
 */
export function spiralEquation(coefficient: number, theta: number): Point {
    const radius = coefficient * theta;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return new Point(x, y);
}

/**
 * gets multiple coordinate points of the spiral
 * spiral parametric equation is: r = coefficient * theta
 * 
 * @param coefficient  the scaling factor for the spiral, coefficient !== 0
 * @param numSamples  the number of sample points of the spiral
 * @returns an array of points that when read left to right connects the dots to make a spiral
 */
export function getSpiralPoints(coefficient: number, numSamples: number): Array<Point> {
    const SAMPLE_RATE = 17;
    const step = (Math.PI / SAMPLE_RATE);

    const out: Array<Point> = [];

    for (let i = 1; i < numSamples + 1; i++) {
        const theta = step * i;
        out.push(spiralEquation(coefficient, theta));
    }

    return out;

}

/**
 * gets the vertices' coordinates of a square
 * 
 * @param center  the center coordinate of the square
 * @param sideLength  the length of the square's side, sideLength > 0
 * @returns  an array of points that when read left to right connects the dots to make an square
 */
export function getSquarePoints(center: Point, sideLength: number): Array<Point> {

    const delta = sideLength / 2;

    const topLeft = new Point(center.x - delta, center.y + delta);
    const topRight = new Point(center.x + delta, center.y + delta);
    const bottomRight = new Point(center.x + delta, center.y - delta);
    const bottomLeft = new Point(center.x - delta, center.y - delta);

    return [topLeft, topRight, bottomRight, bottomLeft, topLeft];
}


/**
 * gets the vertices' coordinates of a triangle
 * 
 * @param center  the center coordinate of the triangle
 * @param circumradius  length from triangle's center to its vertices
 * @returns  an array of points that when read left to right connects the dots to make an triangle
 */
export function getTrianglePoints(center: Point, circumradius: number): Array<Point> {

    const deltaX = Math.sqrt(((circumradius ** 2) - (circumradius / 2) ** 2));
    const deltaY = circumradius / 2;

    const topVertex = new Point(center.x, center.y + circumradius);
    const leftVertex = new Point(center.x - deltaX, center.y - deltaY);
    const rightVertex = new Point(center.x + deltaX, center.y - deltaY);

    return [topVertex, leftVertex, rightVertex, topVertex];
}

/**
 * helper function to pick a random color 
 * 
 * @param colors  the array storing all the possible colors
 * @returns a random color from the given array
 */
export function getRandomColor(colors: Array<PenColor>): PenColor {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}


/**
 * Draw your personal, custom art.
 * 
 * Many interesting images can be drawn using the simple implementation of a turtle.
 * See the problem set handout for more information.
 * 
 * @param turtle the turtle context
 */
export function drawPersonalArt(turtle: Turtle): void {
    const NUM_SAMPLES = 200;
    const ELLIPSE_SAMPLES = 20;

    const circleSpiralCoefficient = 5;
    const circleRadius = 10;

    const squareSpiralCoefficient = 11;
    const squareSideLength = 5;

    const triangleSpiralCoefficient = 15;
    const triangleCircumradius = 8;

    const ellipseSpiralCoefficient = 23;
    const ellipseHeight = 5;
    const ellipseWidth = 12;

    const colors = [PenColor.Black,
    PenColor.Blue,
    PenColor.Cyan,
    PenColor.Gray,
    PenColor.Green,
    PenColor.Magenta,
    PenColor.Orange,
    PenColor.Pink,
    PenColor.Red,
    PenColor.Yellow];

    for (const center of getSpiralPoints(circleSpiralCoefficient, NUM_SAMPLES)) {
        const circlePoints = getEllipsePoints(center, circleRadius, circleRadius, ELLIPSE_SAMPLES);
        const color = getRandomColor(colors);
        drawShape(turtle, circlePoints, color);
    }

    for (const center of getSpiralPoints(squareSpiralCoefficient, NUM_SAMPLES)) {
        const squarePoints = getSquarePoints(center, squareSideLength);
        const color = getRandomColor(colors);
        drawShape(turtle, squarePoints, color);
    }

    for (const center of getSpiralPoints(triangleSpiralCoefficient, NUM_SAMPLES)) {
        const trianglePoints = getTrianglePoints(center, triangleCircumradius);
        const color = getRandomColor(colors);
        drawShape(turtle, trianglePoints, color);
    }

    for (const center of getSpiralPoints(ellipseSpiralCoefficient, NUM_SAMPLES)) {
        const ellipsePoints = getEllipsePoints(center, ellipseWidth, ellipseHeight, ELLIPSE_SAMPLES);
        const color = getRandomColor(colors);
        drawShape(turtle, ellipsePoints, color);
    }
}

/**
 * Main program.
 * 
 * This function creates a turtle and draws in a window.
 */
function main(): void {
    const turtle: Turtle = new DrawableTurtle();

    // const sideLength = 40;
    // drawSquare(turtle, sideLength);
    // drawApproximateCircle(turtle, 6, 20);

    drawPersonalArt(turtle);

    // draw into a file
    const svgDrawing = turtle.getSVG();
    fs.writeFileSync('output.html', `<html>\n${svgDrawing}</html>\n`);

    // open it in a web browser
    void open('output.html');
}

if (require.main === module) {
    main();
    // const path: Array<number> = findPath([new Point(0, -20), new Point(0, 0)]);
    // console.log(path);
}
