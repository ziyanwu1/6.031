import assert from 'assert';

const NUMBER_OF_CELLS = 10;
const STAR_COLOR = '#ffff00';

// categorical colors from
// https://github.com/d3/d3-scale-chromatic/tree/v2.0.0#schemeCategory10
export const COLORS: Array<string> = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
];

// semitransparent versions of those colors
export const BACKGROUNDS = COLORS.map( (color) => color + '60' );


/**
 * Gets you the nearest cell to your position
 * 
 * @param x  x-coordinate we clicked (relative to the canvas)
 * @param y  y-coordinate we clicked (relative to the canvas)
 * @param width  width of the canvas object
 * @param height  height of the canvas object
 * 
 * @returns the top-left corner in relative (x,y) coordinates of the nearest cell
 */
export function nearestCell(x: number, y: number, width: number, height: number): {x: number, y: number} {

    const cellWidth: number = width / NUMBER_OF_CELLS;
    const cellHeight: number = height / NUMBER_OF_CELLS;

    let newX: number;
    let newY: number;

    if (x < 0) {
        newX = 0;
    } else if (x > width) {
        newX = width - cellWidth;
    } else {
        newX = Math.floor(x / cellWidth) * cellWidth;
    }

    if (y < 0) {
        newY = 0;
    } else if (y > height) {
        newY = height - cellHeight;
    } else {
        newY = Math.floor(y / cellHeight) * cellHeight;
    }

    return {x: newX, y: newY};
}


/**
 * Draw a blank puzzle cell (square) with a specific background color
 * Note: (1,1) is the top-left for (row,col). (0,0) is top-left for canvas.
 * 
 * @param canvas  canvas to draw on
 * @param x  x-coordinate of click relative to canvas (not the absolute position)
 * @param y  y-coordinate of click relative to canvas (not the absolute position)
 * @param color  the background color of the cell we want to draw
 */
export function drawCell(canvas: HTMLCanvasElement, x: number, y: number, color: string): void {
    /* Initialize context */
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');

    const width: number = canvas.width;
    const height: number = canvas.height;

    const cellHeight: number = height / NUMBER_OF_CELLS;
    const cellWidth: number = width / NUMBER_OF_CELLS;


    const cell = nearestCell(x, y, width, height);
    
    // save original context settings before we translate and change colors
    context.save();

    // draw the outer outline box of the nearest cell
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeRect(cell.x, cell.y, cellWidth-1, cellHeight-1);

    // fill with a corresponding box color
    context.fillStyle = color;
    context.fillRect(cell.x, cell.y, cellWidth-1, cellHeight-1);

    context.restore();
}


/**
 * Draw a "star" at the given position
 *      (the star will be a yellow circle); 
 * 
 * @param canvas  canvas to draw on
 * @param x  x-coordinate of click relative to canvas (not the absolute position)
 * @param y  y-coordinate of click relative to canvas (not the absolute position)
 */
export function drawStar(canvas: HTMLCanvasElement, x: number, y: number): void {
    /* Initialize context */
    const context = canvas.getContext('2d');
    assert(context, 'unable to get canvas drawing context');

    const width: number = canvas.width;
    const height: number = canvas.height;

    const cellHeight: number = height / NUMBER_OF_CELLS;
    const cellWidth: number = width / NUMBER_OF_CELLS;


    const cell = nearestCell(x, y, width, height);

    // save original context settings before we translate and change colors
    context.save();

    // gets the values we need to draw circle
    const centerX = cell.x + cellWidth / 2;
    const centerY = cell.y + cellHeight / 2;
    const radius = Math.min(cellWidth / 3, cellHeight / 3);

    // draws the shaded circle
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = STAR_COLOR;
    context.fill();


    context.closePath();
    context.restore();
}