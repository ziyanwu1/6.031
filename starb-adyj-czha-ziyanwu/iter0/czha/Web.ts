// Web API + t.s.:
//specs for client/server communication and testing strategy (no puzzle grammar, choosing tests, or implementation)

import express, { Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import asyncHandler from 'express-async-handler';

const app = express();

const PORT = 8789;
app.listen(PORT);
console.log('now listening at http://localhost:' + PORT);

/**
 * GET /blank-puzzle?puzzle=<string>
 *
 * response is a blank nxn puzzle given by the file 'puzzle'(the puzzle given by the file should have no stars)
 * @throws Error if the file does not exist, or the puzzle in the file is not blank
 */ 
app.get('/blank-puzzle', (request: Request, response: Response) => {
    throw new Error("Not implemented yet");
});

// TESTING STRATEGY
// partition on:
//  valid filename, invalid filename
//  in valid file: blank puzzle, puzzle containing stars