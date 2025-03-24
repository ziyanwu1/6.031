import assert from 'assert';
import process from 'process';
import { Server } from 'http';
import express, { Application, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';
// Additional imports from other starb-adyj-czha-ziyanwu files may be necessary.

/** Constants for communicating with the server **/
const APP = express();  // Express application.
const PORT = 8789;  // The server must accept HTTP requests on port 8789 for puzzles identified by their filename.


/**
 * GET /send-puzzle?puzzle=<string>
 * 
 * @response sets up a blank puzzle with <string> being the file name that contains the puzzle's contents.
 *           This blank puzzle should have no stars filled into its squares.
 * @throws an error if <string> is not a file containing puzzle grammar.
 */
APP.get('/send-puzzle', async (request: Request, response: Response) => {  // Note: Might or might not need async.
    throw new Error("TODO: Implement this.");
    // Note that it may also be possible for <string> to be a puzzle's contents as well, but it would result in a
    // clunkier url. Tests would probably be similar to that of PuzzleADT.
});


/**
 * TESTING STRATEGY:
 * 
 * Partition based on:
 *      A1. Valid file name.
 *      A2. Invalid file name.
 */
