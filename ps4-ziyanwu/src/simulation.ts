/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Board } from './Board';

/**
 * Example code for simulating a game.
 * 
 * PS4 instructions: you may use, modify, or remove this file,
 *   completing it is recommended but not required.
 * 
 * @throws Error if an error occurs reading or parsing the board
 */
async function simulationMain(): Promise<void> {
    const filename = 'boards/ab.txt';
    const board: Board = await Board.parseFromFile(filename);
    const size = 5;
    const players = 3;
    const tries = 10;
    const maxDelayMilliseconds = 100;

    // start up one or more players as concurrent asynchronous function calls
    const playerPromises: Array<Promise<void>> = [];
    for (let ii = 0; ii < players; ++ii) {
        playerPromises.push(player(ii));
    }
    // wait for all the players to finish (unless one throws an exception)
    await Promise.all(playerPromises);

    /** @param playerNumber player to simulate */
    async function player(playerNumber: number): Promise<void> {
        // set up this player on the board if necessary

        for (let jj = 0; jj < tries; ++jj) {
            await timeout(Math.random() * maxDelayMilliseconds);
            try {
                await board.flip(playerNumber.toString(), randomInt(size), randomInt(size));
            }
            catch (error) {
                console.log(error);
            }
            // try to flip over a first card at (randomInt(size), randomInt(size))
            //      which might block until this player can control that card

            await timeout(Math.random() * maxDelayMilliseconds);
            try {
                await board.flip(playerNumber.toString(), randomInt(size), randomInt(size));
            }
            catch (error) {
                console.log(error);
            }
            //  and if that succeeded,
            //      try to flip over a second card at (randomInt(size), randomInt(size))
        }
    }
}

/**
 * Random positive integer generator
 * 
 * @param max a positive integer which is the upper bound of the generated number
 * @returns a random integer >= 0 and < max
 */
function randomInt(max: number): number {
    return Math.floor(Math.random() * max);
}


/**
 * @param milliseconds duration to wait
 * @returns a promise that fulfills no less than `milliseconds` after timeout() was called
 */
async function timeout(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

if (require.main === module) {
    void simulationMain();
}
