/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This file runs in Node.js, see the `npm server` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.

import assert from 'assert';
import express, { Request, Response, Application } from 'express';
import { Server } from 'http';
import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';
import fs from 'fs';



/**
 * Takes in a Star Battle game string and returns a new game string that represents the blank board version of the game
 * 
 * @param game  the string representing the Star Battle game
 * 
 * @returns  the resulting game string that represents a blank board version of the game
 */
export function blankify(game: string): string {
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

/**
 * A WebServer class (copied from ps4 server.ts)
 */
export class WebServer {
    
    private readonly app: Application;
    private server: Server|undefined;

    /**
     * Make a new web game server using board that listens for connections on port.
     * 
     * @param requestedPort server port number
     */
    public constructor(
        private readonly requestedPort: number
    ) {
        this.app = express();
        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });

        /**
         * Default puzzle to return to player
         */
        this.app.get('/', asyncHandler(async (request: Request, response: Response) => {
            const filename = "puzzles/kd-1-1-1.starb"; // hard coded requirement for the spec
            const text: string = await fs.promises.readFile(filename, {encoding: 'utf-8'});
            const blankGame = blankify(text);

            response.status(HttpStatus.OK);
            response.type('text');
            response.send(blankGame);
        }));

        /**
         * Gets the puzzle with the given a filename string
         * 
         * GET /blank-puzzle?file=[NAME]
         */
        this.app.get('/blank-puzzle', asyncHandler(async (request: Request, response: Response) => {
            // Assuming the flow goes server -> parser -> client -> puzzle -> client <-> interaction
            
            // filename is JUST the name of the file (no folder locations, no file extensions)
            const filename: string = (request.query["file"] ?? assert.fail("no filename found")) as string;
            try{
                const fullFileName = "./puzzles/"+ filename + ".starb";
                const text: string = await fs.promises.readFile(fullFileName, {encoding: 'utf-8'}); 
                const blankGame = blankify(text);

                response.status(HttpStatus.OK);
                response.type('text');
                response.send(blankGame);
            }
            catch {
                response.status(HttpStatus.NOT_FOUND);
                response.send();
            }
        }));
    }


    /**
     * Start this server.
     * 
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {
        return new Promise(resolve => {
            this.server = this.app.listen(this.requestedPort, () => {
                console.log('server now listening at', this.port);
                resolve();
            });
        });
    }


    /**
     * @returns the actual port that server is listening at. (May be different
     *          than the requestedPort used in the constructor, since if
     *          requestedPort = 0 then an arbitrary available port is chosen.)
     *          Requires that start() has already been called and completed.
     */
    public get port(): number {
        const address = this.server?.address() ?? 'not connected';
        if (typeof(address) === 'string') {
            throw new Error('server is not listening at a port');
        }
        return address.port;
    }

    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}

/**
 * Start a game server.
 */
async function main(): Promise<void> {

    const PORT = 8789;  // hard-codoed port

    const server = new WebServer(PORT);
    await server.start();
}

if (require.main === module) {
    void main();
}
