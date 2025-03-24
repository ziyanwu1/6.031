import assert from 'assert';

const CELL_SIDE = 20;  // Length of side of one cell.
const STAR_RADIUS = 8;  // Width and height of 5-pointed star.
const DOT_SIZE = 3; // Potentially for later if we add dots.

enum Colors {
    Black = "#000000",  // Solide line and star color.
    Gray = "#606060"  // Grayde line and dot color.
}

type sideColors = {up: Colors, right: Colors, down: Colors, left: Colors};  // Type to determine colors of sides of a square.
type coord = [number, number];  // Type for coordinates.
type fiveCoords = [coord, coord, coord, coord, coord];

/**
 * Draw a puzzle cell (square) with borders of either Black, Gray, or a combination of the two.
 * 
 * @param canvas Canvas to use.
 * @param boxCoords Array of type [number, number] for where the box should be drawn. In a 10x10 grid, both
 *                  coordinates should be between 1 and 10 inclusive.
 * @param sideCol A sideColors instance denoting the colors of the each of the cell's sides.
 */
export function drawCell(canvas: HTMLCanvasElement, boxCoords: coord, sideCol: sideColors): void {
    /* Initialize context */
    const context = canvas.getContext('2d');
    assert(context, "No context found :(");
    context.lineWidth = 5;  // Thickness of lines drawn.
    context.beginPath();
    const topLeftCoord: coord = [(boxCoords[0] - 1) * CELL_SIDE, (boxCoords[1] - 1) * CELL_SIDE];  // Coords for top left corner of box.
    context.moveTo(topLeftCoord[0], topLeftCoord[1]);  // Move to top left corner of square to start.


    /* Draw top side of rectangle. */
    context.strokeStyle = sideCol.up;
    context.lineTo(topLeftCoord[0] + CELL_SIDE, topLeftCoord[1]);

    /* Draw right side of rectangle. */
    context.strokeStyle = sideCol.right;
    context.lineTo(topLeftCoord[0] + CELL_SIDE, topLeftCoord[1] + CELL_SIDE);

    /* Draw bottom side of rectangle. */
    context.strokeStyle = sideCol.down;
    context.lineTo(topLeftCoord[0], topLeftCoord[1] + CELL_SIDE);

    /* Draw left side of rectangle. */
    context.strokeStyle = sideCol.left;
    context.lineTo(topLeftCoord[0], topLeftCoord[1]);

    context.strokeStyle = Colors.Black;  // Revert the color back to black if anything arises.
}

/**
 * Draws a star inside the space/cell represented by boxCoords.
 * 
 * @param canvas  Canvas to use.
 * @param boxCoords Array of type [number, number] coordinate that represents the cell where the star
 *                  should be drawn.
 */
export function drawStar(canvas: HTMLCanvasElement, boxCoords: coord): void {
    /* Initialize context */
    const context = canvas.getContext('2d');
    assert(context, "No context found :(");
    context.lineWidth = 3;  // Thickness of lines drawn.
    context.strokeStyle = Colors.Black;

    /* Coordinates of star */
    const topLeftCoord: coord = [(boxCoords[0] - 1) * CELL_SIDE, (boxCoords[1] - 1) * CELL_SIDE];  // Coords for top left corner of box.
    const starCoords: coord[] = [90, 234, 18, 162, 306]  // Vertices of star
        .map((x: number): number => x * Math.PI / 180)  // Change to radians
        .map((x: number): coord => [STAR_RADIUS * Math.sin(x), STAR_RADIUS * Math.cos(x)])  // Create five points of a star.
        .map((x: coord): coord => [topLeftCoord[0] + x[0] + CELL_SIDE / 2, topLeftCoord[1] + x[1] + CELL_SIDE / 2]);  // Center star inside box.

    /* Draw the star */
    context.beginPath();
    const firstStarPoint: coord = starCoords[0] ?? [0, 0];
    context.moveTo(firstStarPoint[0], firstStarPoint[1]);  // Move to first point.
    for (let x = 1; x < starCoords.length; x++) {  // Draw to all other points.
        const starPoint: coord = starCoords[x] ?? [0, 0];
        context.moveTo(starPoint[0], starPoint[1]);
    }
}

// Demonstration of functions
export function demo(): void {
    
    // output area for printing
    const outputArea: HTMLElement = document.getElementById('outputArea') ?? assert.fail('missing output area');
    // canvas for drawing
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');
    
    drawCell(canvas, [3, 3], {up: Colors.Black, right: Colors.Black, down: Colors.Gray, left: Colors.Black});
    drawStar(canvas, [3, 3]);
    drawStar(canvas, [4, 2]);
}