/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import fs from 'fs';
import { Board } from '../src/Board';
import { flip, look, map, watch } from '../src/commands';


/**
 * Tests for the Board abstract data type.
 */
describe('flip() and look()', function () {

    //  Testing strategy
    //   
    //  partition on the stage 1 rules of the game: 1-A, 1-B, 1-C, 1-D
    //  partition on the stage 2 rules of the game: 2-A, 2-B, 2-D, 2-E
    //  partition on the stage 3 rules of the game: 3-A, 3-B, none
    //  partition on the number of player: 1, 2, > 2


    it('one player matching two cards correctly, then picking some other card. 1-B, 2-D, 3-A', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra);
        const middle2 = await flip(board, "bob", 0, 2);
        assert.strictEqual(middle2, "5x5\nmy A\ndown\nmy A\n" + extra);
        const result = await flip(board, "bob", 0, 1);
        assert.strictEqual(result, "5x5\nnone\nmy B\nnone\n" + extra);
    });

    it('two players trying to flip the same card (leads to blocking), but the first player eventually lets go. 1-D, 2-E', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');
        await flip(board, "bob", 0, 0);
        setTimeout(async () => { await flip(board, "bob", 0, 1); }, 20);
        await flip(board, "john", 0, 0);

        const resultBob = await look(board, "bob");
        const resultJohn = await look(board, "john");

        let extra = "";
        for (let i = 0; i < 23; ++i) {
            extra += "down\n";
        }

        assert.strictEqual(resultBob, "5x5\nup A\nup B\n" + extra, "not matching for bob");
        assert.strictEqual(resultJohn, "5x5\nmy A\nup B\n" + extra, "not matching for john");
    });

    it('player tries to flip a none card, should have operation fail. 1-A, 2-D, 3-A', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra, "not matching intermediate flip");
        const middle2 = await flip(board, "bob", 0, 2);
        assert.strictEqual(middle2, "5x5\nmy A\ndown\nmy A\n" + extra, "not matching intermediate flip");
        const middle3 = await flip(board, "bob", 0, 1);
        assert.strictEqual(middle3, "5x5\nnone\nmy B\nnone\n" + extra, "not matching intermediate flip");

        await assert.rejects(flip(board, "john", 0, 0), "expected promise to reject bc player is hitting a 'none' card");
        assert.strictEqual(await look(board, "john"), "5x5\nnone\nup B\nnone\n" + extra, "expected john's look to be correct");
    });

    it('card is face up but not controlled, and player picks that card. 1-C, 2-E', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra);
        const middle2 = await flip(board, "bob", 0, 1);
        assert.strictEqual(middle2, "5x5\nup A\nup B\ndown\n" + extra);

        const result = await flip(board, "john", 0, 0);
        assert.strictEqual(result, "5x5\nmy A\nup B\ndown\n" + extra);
    });

    it('during player\'s card pick, they picked an empty card. this should result in an error. 2-A', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        // bob's actions
        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra, "not matching intermediate flip");
        const middle2 = await flip(board, "bob", 0, 2);
        assert.strictEqual(middle2, "5x5\nmy A\ndown\nmy A\n" + extra, "not matching intermediate flip");
        const middle3 = await flip(board, "bob", 0, 1);
        assert.strictEqual(middle3, "5x5\nnone\nmy B\nnone\n" + extra, "not matching intermediate flip");

        // john's actions
        let johnExtra = "";
        for (let i = 0; i < 21; ++i) {
            johnExtra += "down\n";
        }

        const middle4 = await flip(board, "john", 0, 3);
        assert.strictEqual(middle4, "5x5\nnone\nup B\nnone\nmy B\n" + johnExtra);

        await assert.rejects(flip(board, "john", 0, 0), "expected promise to reject bc john is hitting a 'none' card");
        assert.strictEqual(await look(board, "john"), "5x5\nnone\nup B\nnone\nup B\n" + johnExtra, "expected john's look to be correct");
    });

    it('during player\'s card pick, they picked an already controlled card. this should result in an error. 2-B', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        // bob's actions
        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra, "not matching intermediate flip");

        // john's actions
        const middle2 = await flip(board, "john", 0, 1);
        assert.strictEqual(middle2, "5x5\nup A\nmy B\ndown\n" + extra, "not matching intermediate flip");

        await assert.rejects(flip(board, "john", 0, 0), "expected promise to reject bc john is hitting a controlled card card");
        assert.strictEqual(await look(board, "john"), "5x5\nup A\nup B\ndown\n" + extra, "expected john's look to be correct");
    });

    it('after two non matching cards, relinquished cards not being controlled should be put face down. 2-E, 3-B', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra);
        const result = await flip(board, "bob", 0, 1);
        assert.strictEqual(result, "5x5\nup A\nup B\ndown\n" + extra);
        const middle2 = await flip(board, "bob", 0, 2);
        assert.strictEqual(middle2, "5x5\ndown\ndown\nmy A\n" + extra);
    });

    it('3 players playing the game.', async function () {
        const board = await Board.parseFromFile('boards/perfect.txt');
        // 🦄 🦄 🌈
        // 🌈 🌈 🦄
        // 🌈 🦄 🌈


        let extra = "";
        for (let i = 0; i < 5; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "3x3\nmy 🦄\ndown\ndown\ndown\n" + extra);

        const middle2 = await flip(board, "john", 0, 1);
        assert.strictEqual(middle2, "3x3\nup 🦄\nmy 🦄\ndown\ndown\n" + extra);

        const promise1: Promise<void> = new Promise(resolve => setTimeout(async () => {
            await flip(board, "adam", 0, 1); assert.strictEqual(await look(board, "adam"), "3x3\nup 🦄\nmy 🦄\ndown\ndown\n" + extra); resolve();
        }, 0));

        await assert.rejects(flip(board, "john", 0, 0));
        assert.strictEqual(await look(board, "john"), "3x3\nup 🦄\nup 🦄\ndown\ndown\n" + extra);

        await promise1;

        const middle3 = await flip(board, "bob", 1, 2);
        assert.strictEqual(middle3, "3x3\nmy 🦄\nup 🦄\ndown\ndown\ndown\nmy 🦄\ndown\ndown\ndown\n");

        const middle4 = await flip(board, "adam", 2, 1);
        assert.strictEqual(middle4, "3x3\nup 🦄\nmy 🦄\ndown\ndown\ndown\nup 🦄\ndown\nmy 🦄\ndown\n");
    });

});


describe('map()', function () {

    // map():
    //
    // paritions:
    //      parition on new mapping values: completely the same, mix of same and different, completely different

    it("mapping all cards to the same different letter", async function () {
        const board = await Board.parseFromFile('boards/perfect.txt');
        // 🦄 🦄 🌈
        // 🌈 🌈 🦄
        // 🌈 🦄 🌈

        let extra = "";
        for (let i = 0; i < 8; ++i) {
            extra += "down\n";
        }

        const middle1 = await board.flip("bob", 0, 0);
        assert.strictEqual(middle1, "3x3\nmy 🦄\n" + extra);

        const mapResult = await map(board, "bob", (card) => { return new Promise((resolve) => resolve("test")); });
        assert.strictEqual(mapResult, "3x3\nmy test\n" + extra, "expected map to change all cards");

        let thirdExtra = "";
        for (let i = 0; i < 6; ++i) {
            thirdExtra += "down\n";
        }

        const middle2 = await board.flip("bob", 0, 1);
        assert.strictEqual(middle2, "3x3\nmy test\nmy test\ndown\n" + thirdExtra, "expected flipping cards to remain consistent");

        const result = await board.flip("bob", 0, 2);
        assert.strictEqual(result, "3x3\nnone\nnone\nmy test\n" + thirdExtra, "expected flipping cards to remain consistent");
    });


    it('map all A -> B and all B -> D, keeping some letters the same and others different', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra);

        const mapResults = await map(board, "bob", (card) => {
            return new Promise((resolve) => {
                if ((card) === 'A') { resolve('B'); }
                else if ((card) === 'B') { resolve('D'); };
            });
        });

        assert.strictEqual(mapResults, "5x5\nmy B\ndown\ndown\n" + extra, "mapping new board should be correct");

        const middle2 = await flip(board, "bob", 0, 1);
        assert.strictEqual(middle2, "5x5\nup B\nup D\ndown\n" + extra, "expected correct intermediate flip");

        const result = await flip(board, "bob", 0, 2);
        assert.strictEqual(result, "5x5\ndown\ndown\nmy B\n" + extra, "expected correct final flip");
    });

    it('identity mapping', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const middle1 = await flip(board, "bob", 0, 0);
        assert.strictEqual(middle1, "5x5\nmy A\ndown\ndown\n" + extra);

        const mapResults = await map(board, "bob", (card) => {
            return new Promise((resolve) => {
                resolve(card);
            });
        });

        assert.strictEqual(mapResults, "5x5\nmy A\ndown\ndown\n" + extra, "mapping new board should be correct");

        const middle2 = await flip(board, "bob", 0, 2);
        assert.strictEqual(middle2, "5x5\nmy A\ndown\nmy A\n" + extra, "expected correct intermediate flip");

        const result = await flip(board, "bob", 0, 1);
        assert.strictEqual(result, "5x5\nnone\nmy B\nnone\n" + extra, "expected correct final flip");
    });
});



describe('watch()', function () {

    // watch()
    //
    // paritions:
    //  
    //      partition on amount of watches: 1, > 1
    //      partition on number of people: 1, > 1

    it('a one person simple watch test', async function () {
        const board = await Board.parseFromFile('boards/ab.txt');

        let extra = "";
        for (let i = 0; i < 22; ++i) {
            extra += "down\n";
        }

        const promise1: Promise<void> = new Promise(resolve => setTimeout(async () => {
            await flip(board, "bob", 0, 0); assert.strictEqual(await look(board, "bob"), "5x5\nmy A\ndown\ndown\n" + extra); resolve();
        }, 0));

        const watch1 = await watch(board, "bob");
        assert.strictEqual(watch1, await look(board, "bob"));

        await promise1;
    });

    it('two people each watching', async function () {
        const board = await Board.parseFromFile('boards/perfect.txt');
        // 🦄 🦄 🌈
        // 🌈 🌈 🦄
        // 🌈 🦄 🌈

        let extra = "";
        for (let i = 0; i < 6; ++i) {
            extra += "down\n";
        }

        const promise1: Promise<void> = new Promise(resolve => setTimeout(async () => {
            await flip(board, "bob", 0, 0); assert.strictEqual(await look(board, "bob"), "3x3\nmy 🦄\ndown\ndown\n" + extra); resolve();
        }, 0));

        const watch1 = watch(board, "bob");
        const watch2 = watch(board, "john");

        await promise1;
        const res1 = await watch1;
        const res2 = await watch2;

        assert.strictEqual(res1, await look(board, "bob"));
        assert.strictEqual(res2, await look(board, "john"));
    });

});


/**
 * Example test case that uses async/await to test an asynchronous function.
 * Feel free to delete these example tests.
 */
describe('async test cases', function () {

    it('reads a file asynchronously', async function () {
        const fileContents = (await fs.promises.readFile('boards/ab.txt')).toString();
        assert(fileContents.startsWith('5x5'));
    });
});
