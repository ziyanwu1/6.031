/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This test file runs in Node.js, see the `npm test` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.
// See the *Testing* section of the project handout for more advice.

import assert from 'assert';
import { Coord, Puzzle } from '../src/Puzzle';
import { parseExpression } from '../src/Parser';
import { blankify } from '../src/StarbServer';
import * as fs from 'fs';

const testDots = false;  // Determine whether we're testing for dots or not.

describe('Puzzle ADT', function() {
    
    /**
     *  TESTING STRATEGY:
     * 
     *      Partition clickOn() Based On:
     *          x Cell Has Star (A1)
     *          x Cell Has No Star (A2)
     *          x Cell Doesn't Exist (A3)
     * 
     *      Partition getRegion() Based On:
     *          x Cell Exists (B1)
     *          x Cell Doesn't Exist (B2)
     * 
     *      Partition getValue() Based On:
     *          x Output "star" (C1) 
     *          x Output "blank" (C2)
     *  
     *      Partition equalValue() Based On:
     *          x Two Equal Puzzles (D1)
     *          x Two Unequal Puzzles (D2)
     * 
     *      Partition solved() Based On:
     *          x Legit Solved (E1)
     *          x Too Many/Little Stars Horizontally (E2)
     *          x Too Many/Little Stars Vertically (E3)
     *          x Too Many/Little Stars in a Region (E4)
     *          x Adjacent Stars (E5)
     */

    const filename = "./puzzles/kd-1-1-1.starb";
    const puzzle111: Puzzle = parseExpression(blankify(fs.readFileSync(filename, 'utf-8')));
    
    const filename2 = "./puzzles/kd-6-31-6.starb";
    const puzzle6316: Puzzle = parseExpression(blankify(fs.readFileSync(filename2, 'utf-8')));

    it('Click to Draw Star (A1, C1, C2)', function() {
        const testCase: Puzzle = puzzle111.clickOn(2, 5).clickOn(4, 10);  // Click on cells (2, 5) and (4, 10)
        assert.equal(testCase.getValue(4, 10), "star",
                     "Expected (4, 10) on puzzle kd-1-1-1.starb to be starred. Was not starred.");
        assert.equal(testCase.getValue(2, 5), "star",
                     "Expected (2, 5) on puzzle kd-1-1-1.starb to be starred. Was not starred.");
        assert.equal(testCase.getValue(4, 5), "blank",
                     "Expected (4, 5) on puzzle kd-1-1-1.starb to be blank. Was not blank.");
        assert(! testCase.equalValue(puzzle111),
               "clickOn should not be mutating puzzle111.")
    });
    it('Click to Remove Star (A2, C1, C2)', function() {
        let testCase: Puzzle = puzzle111.clickOn(2, 5).clickOn(2, 5);
        if (testDots) testCase = testCase.clickOn(2, 5);  // If dots were implemented, 3 clicks needed to cycle back to blank.
        assert.equal(testCase.getValue(4, 10), "blank",
                     "Expected (4, 10) on puzzle kd-1-1-1.starb to be blank. Was not blank.");
        testCase = testCase.clickOn(8, 7).clickOn(8, 6).clickOn(8, 7).clickOn(8, 7).clickOn(8, 7).clickOn(8, 7).clickOn(8, 7);
        assert.equal(testCase.getValue(8, 7), "blank",
                     "Expected (8, 7) on puzzle kd-1-1-1.starb to be blank. Was not blank.");
        assert.equal(testCase.getValue(8, 6), "star",
                     "Expected (8, 6) on puzzle kd-1-1-1.starb to be starred. Was not starred.");
    });
    it('Click on Square Outside Scope (A3)', function() {
        const testCase: Puzzle = puzzle111;
        assert.throws(() => testCase.clickOn(0, 3),
                      "clickOn should throw an error if either parameter is 0.");
        assert.throws(() => testCase.clickOn(7, -2),
                      "clickOn should throw an error if either parameter is negative.");
        assert.throws(() => testCase.clickOn(11, 3),
                      "clickOn should throw an error if either parameter is greater than the dimension of the puzzle.");
        assert.throws(() => testCase.clickOn(1.5, 3),
                      "clickOn should throw an error if either parameter is a decimal.");
        assert(testCase.equalValue(puzzle111),
               "Any erroring clickOn calls should not mutate testCase.");
    });
    it('Get Region of Valid Square (B1)', function() {
        const testCase: Puzzle = puzzle111;
        assert.deepStrictEqual(
            testCase.getRegion(5, 2),
            new Set([51, 81, 21, 31, 32, 33, 34, 41, 42, 43, 52, 61, 62, 71, 72, 73, 74, 75, 76]),
            "Test case failed on kd-1-1-1.starb."
        );
        assert(testCase.equalValue(puzzle111),
               "getRegion function should not mutate the function.");
        const testCase2: Puzzle = puzzle6316.clickOn(3, 9);
        assert.deepStrictEqual(
            testCase2.getRegion(3, 9),
            new Set([46, 38, 16, 17, 26, 27, 28, 29, 36, 37, 39, 47, 56, 57, 58, 66]),
            "Test case failed on clicked star on kd-6-31-6.starb."
        );
        assert.deepStrictEqual(
            testCase2.getRegion(7, 7),
            new Set([67, 79, 68, 78, 88]),
            "Test case failed on solution star for kd-6-31-6.starb."
        );
        assert(! testCase2.equalValue(puzzle6316),
               "getRegion function should not mutate the function.");
    });
    it('Get Region of Invalid Squares (B2)', function() {
        const testCase: Puzzle = puzzle111;
        assert.throws(() => testCase.getRegion(0, 3),
                      "getRegion should throw an error if either parameter is 0.");
        assert.throws(() => testCase.getRegion(7, -2),
                      "getRegion should throw an error if either parameter is negative.");
        assert.throws(() => testCase.getRegion(11, 3),
                      "getRegion should throw an error if either parameter is greater than the dimension of the puzzle.");
        assert.throws(() => testCase.getRegion(1.5, 3),
                      "getRegion should throw an error if either parameter is a decimal.");
        assert(testCase.equalValue(puzzle111),
               "Any erroring getRegion calls should not mutate testCase.");
    });
    it('Check Two Puzzles as Equal (D1)', function() {
        const testCase: Puzzle = puzzle111;
        const testCase2: Puzzle = puzzle111;
        assert(testCase.equalValue(testCase), "Expected puzzle to equal itself.");
        assert(testCase.equalValue(testCase2), "Expected puzzle to equal an alias.");
        assert(testCase.equalValue(puzzle111), "Expected puzzle to equal an alias.");
        assert(testCase.equalValue(testCase.clickOn(2, 5).clickOn(2, 5).clickOn(2, 5).clickOn(2, 5).clickOn(2, 5).clickOn(2, 5)),
               "Expected puzzle to equal an equivalent non-alias.");
    });
    it('Check Two Puzzles as Not Equal (D2)', function() {
        const testCase: Puzzle = puzzle111;
        const testCase2: Puzzle = puzzle6316;
        assert(! testCase.equalValue(testCase.clickOn(2, 5)), "Expected puzzles with different stars to be unequal.");
        assert(! testCase.clickOn(1, 1).equalValue(testCase2.clickOn(1, 1)), 
               "Expected puzzles with different regions to be unequal.");
    });
    const solved111: Puzzle = puzzle111.clickOn(1, 2).clickOn(1, 5).clickOn(2, 9).clickOn(4, 10).clickOn(3, 2)
                                       .clickOn(3, 4).clickOn(2, 7).clickOn(4, 8).clickOn(6, 1).clickOn(9, 1)
                                       .clickOn(5, 4).clickOn(5, 6).clickOn(6, 8).clickOn(8, 7).clickOn(7, 3)
                                       .clickOn(7, 5).clickOn(8, 9).clickOn(10, 10).clickOn(9, 3).clickOn(10, 6);
    const solved6316: Puzzle = puzzle6316.clickOn(1, 1).clickOn(3, 1).clickOn(2, 3).clickOn(3, 5).clickOn(1, 6)
                                         .clickOn(2, 8).clickOn(6, 2).clickOn(5, 4).clickOn(5, 6).clickOn(4, 8)
                                         .clickOn(4, 10).clickOn(6, 10).clickOn(7, 4).clickOn(8, 2).clickOn(9, 5)
                                         .clickOn(10, 3).clickOn(7, 7).clickOn(8, 9).clickOn(9, 7).clickOn(10, 9);
    it('Check Legitimately Solved Puzzle (E1)', function() {
        assert(solved111.solved(), "Expected `solved` function to return true for solved kd-1-1-1.starb.");
        assert(solved6316.solved(), "Expected `solved` function to return true for solved kd-6-31-6.starb.");
    });
    it('Check Row/Col Miscounts in Puzzles (E2, E3)', function() {
        assert(! solved111.clickOn(10, 8).solved(), 
               "Expected `solved` function to return false for an extra star at (10, 8) for kd-1-1-1.starb.");
        assert(! solved6316.clickOn(2, 3).clickOn(1, 4).solved(), 
               "Expected `solved` function to return false for a misstar on (1, 4) instead of (2, 3) for kd-6-31-6.starb.");
    });
    it('Check Region Miscounts in Puzzles (E4)', function() {
        assert(! solved111.clickOn(4, 10).clickOn(6, 10).clickOn(4, 1).clickOn(6, 1).solved(),
               "Expected `solved` function to return false for missing star in top right region of kd-1-1-1.starb.");
        assert(! solved6316.clickOn(3, 1).clickOn(4, 1).clickOn(3, 10).clickOn(4, 10).solved(),
               "Expected `solved` function to return false for missing star in top left region of kd-6-31-6.starb.");
    });
    it('Check Adjacent Stars in Puzzles (E5)', function() {
        assert(! solved6316.clickOn(1, 1).clickOn(2, 1).clickOn(2, 3).clickOn(1, 3).solved(),
               "kd-6-31-6.starb not solved because top left stars are adjacent.");
        assert(! solved6316.clickOn(2, 3).clickOn(2, 4).clickOn(5, 3).clickOn(5, 4).solved(),
               "kd-6-31-6.starb not solved because diagonally adjacent stars are still adjacent.");
    });

});


