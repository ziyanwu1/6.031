/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This file runs in Node.js, see the `npm server` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.

import assert from 'assert';
import {Client} from './StarbClient';
import {nearestCell} from './Drawing';


// output area for printing
const outputArea: HTMLElement = document.getElementById('outputArea') ?? assert.fail('missing output area');
    
/**
 * Print a message by appending it to an HTML element.
 * 
 * @param outputArea HTML element that should display the message
 * @param message message to display
 */
export function printOutput(outputArea: HTMLElement, message: string): void {
    // append the message to the output area
    outputArea.innerText += message + '\n';

    // scroll the output area so that what we just printed is visible
    outputArea.scrollTop = outputArea.scrollHeight;
}

/**
 * Displays the instructions to the user on the website
 */
export function displayInstructions(): void{
    // add initial instructions to the output area
    printOutput(outputArea, `Click in the canvas above to draw a box centered at that point`);
}

/**
 * Interacts with client to add or remove a star based on the user's click on the website.
 * Updates the webpage to announce whether the puzzle is solved. 
 * 
 * @param client client object
 * @param canvas canvas used by the client
 * @param x x coordinate of the click
 * @param y y coordinate of the click
 */
export function handleClick(client: Client, canvas: HTMLCanvasElement, x: number, y: number): void{
    const clickedCanvasCell = nearestCell(x,y, canvas.width, canvas.height);
    client.click(clickedCanvasCell.x, clickedCanvasCell.y);

    const message = client.announceSolved();
    printOutput(outputArea, message);
}
