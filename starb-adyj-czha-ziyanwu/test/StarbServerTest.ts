/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This test file runs in Node.js, see the `npm test` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.
// See the *Testing* section of the project handout for more advice.

import assert from 'assert';
import { WebServer } from '../src/StarbServer';
import fetch from 'node-fetch';
import HttpStatus from 'http-status-codes';
import fs from 'fs';

const PORT = 8789;



function blankify(game: string): string {
    let blankGame = "";
    
    const lines: Array<string> = game.split('\n');

    for (const line of lines) {
        if (line.startsWith('#')) {
            blankGame += line + '\n';
        } else if (line.includes('x')) {
            blankGame += line + '\n';
        } else if (line.includes('|')) {
            const newLine = '| ' + line.replace('|', "");
            blankGame += newLine + '\n';
        }
    }

    return blankGame;
}



describe('server', function() {
    
    //  Testing Strategy
    // 
    //  app.get('/'): (no test cases needed as hard-coded puzzle is always returns)
    //      
    //  app.get('/blank-puzzle'):
    //      partition on valid file name: yes, no
    //
    
    it('calling /blank-puzzle on valid file name', async function () {
        const server = new WebServer(PORT);
        await server.start();

        const url = `http://localhost:${PORT}/blank-puzzle?file=kd-6-31-6`;

        const response = await fetch(url);
        const expected = blankify(fs.readFileSync('./puzzles/kd-6-31-6.starb', {encoding: 'utf-8'}));

        const text: string = await response.text();

        assert.strictEqual(text, expected);

        server.stop();
    })

    it('calling /blank-puzzle on invalid file name', async function () {
        const server = new WebServer(PORT);
        await server.start();

        const url = `http://localhost:${PORT}/blank-puzzle?file=nonvalidfilename`;
        const response = await fetch(url);

        assert.strictEqual(response.status, HttpStatus.NOT_FOUND);

        server.stop();
    })
    
});
