/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { AnswerDifficulty, Flashcard } from '../src/flashcards';
import { toBucketSets, getBucketRange, practice, update, getHint, computeProgress } from '../src/algorithm';

/*
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested functions (except getHint, as
 * described in the ps1 handout).
 * 
 * In particular, your test cases must not call helper functions of your own that
 * you have put in algorithms.ts or any other file in src/.
 * If you need such helper functions in your testing code, define them in
 * this test class or in another class in the test/ folder.
 */

describe('toBucketSets', function () {
    /*
     *  Testing Strategy:
     * 
     *      partition by number of cards:       0, 1, > 1
     *      partition by first bucket:          a card exists in the first bucket, no card exists in the first bucket
     *      partition by bucket distribution:   all cards in same bucket, 
     *                                          all cards in different buckets (and # cards > 1), 
     *                                          some cards in same bucket and some cards in different buckets
     *      partition on buckets' card count:   all buckets have no cards,
     *                                          all buckets have at least one card,  
     *                                          buckets have combination of no cards and at least one card.
     */

    // Given test case
    it('covers two cards in different buckets', function () {
        const map: Map<Flashcard, number> = new Map([
            [Flashcard.make("sairina", "magic"), 0],
            [Flashcard.make("lavaralda", "tree"), 1]]);
        const buckets: Array<Set<Flashcard>> = toBucketSets(map);
        assert.deepStrictEqual(buckets[0], new Set([Flashcard.make("sairina", "magic")]), "expected correct bucket contents");
        assert.deepStrictEqual(buckets[1], new Set([Flashcard.make("lavaralda", "tree")]), "expected correct bucket contents");
        for (let i = 2; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
        }
    });

    it('covers number of cards = 0, all buckets have no cards', function () {
        const map: Map<Flashcard, number> = new Map();
        const buckets: Array<Set<Flashcard>> = toBucketSets(map);
        for (let i = 0; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected no cards in any bucket");
        }
    });

    it('covers number of cards = 1, a card exists in the first bucket'
        + 'all cards in same bucket, all buckets have at least one card', function () {
            const map: Map<Flashcard, number> = new Map([
                [Flashcard.make('front', 'back'), 0],
            ]);
            const buckets: Array<Set<Flashcard>> = toBucketSets(map);
            assert.deepStrictEqual(buckets[0], new Set([Flashcard.make('front', 'back')]), "expected correct bucket contents");
            for (let i = 1; i < buckets.length; ++i) {
                assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
            }
        });

    it('covers number of cards >1, no card exists in the first bucket, '
        + 'all cards in different buckets, buckets have combination of no cards and at least one card', function () {
            const map: Map<Flashcard, number> = new Map([
                [Flashcard.make('front1', 'back1'), 3],
                [Flashcard.make('front2', 'back2'), 5],
                [Flashcard.make('front3', 'back3'), 6],
            ]);
            const buckets: Array<Set<Flashcard>> = toBucketSets(map);
            assert.deepStrictEqual(buckets[3], new Set([Flashcard.make('front1', 'back1')]), "expected correct bucket contents");
            assert.deepStrictEqual(buckets[5], new Set([Flashcard.make('front2', 'back2')]), "expected correct bucket contents");
            assert.deepStrictEqual(buckets[6], new Set([Flashcard.make('front3', 'back3')]), "expected correct bucket contents");

            const emptyIndices: Array<number> = [0, 1, 2, 4];
            for (const index of emptyIndices) {
                assert.strictEqual(buckets[index].size, 0, "expected other buckets to be empty (middle)");
            }
            for (let i = 7; i < buckets.length; ++i) {
                assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty (end)");
            }
        });

    it('covers number of cards >1, a card exists in the first bucket, '
        + 'some cards in same bucket and some cards in different buckets, all buckets have at least one card', function () {
            const map: Map<Flashcard, number> = new Map([
                [Flashcard.make('front0', 'back0'), 0],
                [Flashcard.make('front00', 'back00'), 0],
                [Flashcard.make('front1', 'back1'), 1],
                [Flashcard.make('front2', 'back2'), 2],
                [Flashcard.make('front3', 'back3'), 3],
                [Flashcard.make('front33', 'back33'), 3],
            ]);

            const buckets: Array<Set<Flashcard>> = toBucketSets(map);
            assert.deepStrictEqual(buckets[0], new Set([Flashcard.make('front0', 'back0'), Flashcard.make('front00', 'back00')]), "expected correct bucket contents");
            assert.deepStrictEqual(buckets[1], new Set([Flashcard.make('front1', 'back1')]), "expected correct bucket contents");
            assert.deepStrictEqual(buckets[2], new Set([Flashcard.make('front2', 'back2')]), "expected correct bucket contents");
            assert.deepStrictEqual(buckets[3], new Set([Flashcard.make('front3', 'back3'), Flashcard.make('front33', 'back33')]), "expected correct bucket contents");
            for (let i = 4; i < buckets.length; ++i) {
                assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
            }
        });
});

describe('getBucketRange', function () {
    /*
     * Testing Strategy:
     * 
     * Partitions:
     *      partition on (high - low) adjacency:    high and low are equal, high and low are adjacent, high and low aren't adjacent nor equal
     *      partition by first bucket:              a card exists in the first bucket, no card exists in the first bucket
     *      partition by last bucket:               a cards exist in the last bucket, no card exists in the last bucket
     *      partition on buckets' card count:       all buckets have no cards,
     *                                              all buckets have at least one card,  
     *                                              buckets have combination of no cards and at least one card.
     *      partition by bucket distribution:       all cards in same bucket, 
     *                                              all cards in different buckets (and # cards > 1), 
     *                                              some cards in same bucket and some cards in different buckets
     *      
     */

    // given test case
    it('covers two adjacent buckets', function () {
        const buckets: Array<Set<Flashcard>> = [
            new Set([Flashcard.make("sehen", "see")]),
            new Set([Flashcard.make("gehen", "go")])
        ];
        const range: Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low: number = range[0];
        const high: number = range[1];
        assert.strictEqual(low, 0, "expected correct low");
        assert.strictEqual(high, 1, "expected correct high");
    });

    it('all buckets have no cards', function () {
        const buckets: Array<Set<Flashcard>> = [];
        const range: Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low: number = range[0];
        const high: number = range[1];
        assert.strictEqual(high - low, 0, "expected (high - low) as small as possible");
        assert(low >= 0);
        assert(high >= low);
    });

    it('covers high and low are adjacent, a card exists in the first bucket, a card exists in the last bucket, \
        all buckets have at least one card, all cards in different buckets', function () {
        const buckets: Array<Set<Flashcard>> = [
            new Set([Flashcard.make('front1', 'back1')]),
            new Set([Flashcard.make('front2', 'back2')])
        ];

        const range: Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low: number = range[0];
        const high: number = range[1];
        assert.strictEqual(low, 0, "expected correct low");
        assert.strictEqual(high, 1, "expected correct high");
    });

    it('covers high and low aren\'t adjacent or equal, a card exists in the first bucket, a card exists in the last bucket, \
        all buckets have at least one card, some cards in same bucket and some cards in different buckets', function () {
        const buckets: Array<Set<Flashcard>> = [
            new Set([Flashcard.make('front1', 'back1'), Flashcard.make('front11', 'back11')]),
            new Set([Flashcard.make('front2', 'back2')]),
            new Set([Flashcard.make('front3', 'back3'), Flashcard.make('front33', 'back33')]),
            new Set([Flashcard.make('front4', 'back4')])
        ];

        const range: Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low: number = range[0];
        const high: number = range[1];
        assert.strictEqual(low, 0, "expected correct low");
        assert.strictEqual(high, 3, "expected correct high");
    });

    it('covers high and low are equal, no card exists in the first bucket, no cards exists in the last bucket, \
        buckets have combination of no cards and at least one card, all cards in same bucket', function () {
        const buckets: Array<Set<Flashcard>> = [
            new Set([]),
            new Set([]),
            new Set([Flashcard.make('front1', 'back1'), Flashcard.make('front11', 'back11')]),
            new Set([]),
        ];

        const range: Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low: number = range[0];
        const high: number = range[1];
        assert.strictEqual(low, 2, "expected correct low");
        assert.strictEqual(high, 2, "expected correct high");
    });

});

describe('practice', function () {
    /*
     * Testing Strategy:
     * 
     * Partitions:
     * 
     * partition on days:                   1, >1
     * partition on buckets' card count:    all buckets have no cards,
     *                                      all buckets have at least one card,  
     *                                      buckets have combination of no cards and at least one card
     * partition by bucket distribution:    all cards in same bucket, 
     *                                      all cards in different buckets (and # cards > 1), 
     *                                      some cards in same bucket and some cards in different buckets
     * partition on retiredBucket:          0, < buckets.length, === buckets.length, > buckets.length
     */

    // given test case
    it('covers no cards', function () {
        assert.deepStrictEqual(practice(1, [new Set()], 0), [], "expected no cards to practice");
    });

    it('covers all buckets have no cards', function () {

        const day = 1;
        const buckets: Array<Set<Flashcard>> = [
            new Set()
        ];
        const retiredBucket = 0;

        const sequence: Array<Flashcard> = practice(day, buckets, retiredBucket);

        assert.strictEqual(sequence.length, 0, "expected empty answer");
        assert.deepStrictEqual(sequence, [], "expected empty answer");

    });

    it('covers days > 1, all buckets have at least one card, all cards in different buckets, '
        + 'retiredBucket === 0', function () {
            const day = 2;
            const buckets: Array<Set<Flashcard>> = [
                new Set([Flashcard.make('front0', 'back0')]),
                new Set([Flashcard.make('front1', 'back1')]),
                new Set([Flashcard.make('front2', 'back2')]),
                new Set([Flashcard.make('front3', 'back3')])
            ];
            const retiredBucket = 0;

            const sequence: Array<Flashcard> = practice(day, buckets, retiredBucket);

            assert.strictEqual(sequence.length, 0, "expected empty answer");
            assert.deepStrictEqual(sequence, [], "expected empty answer");
        });

    it('covers days === 1, buckets have combination of no cards and at least one card, '
        + 'some cards in same bucket and some cards in different buckets, retiredBucket < buckets.length', function () {

            const day = 4;
            const buckets: Array<Set<Flashcard>> = [
                new Set([Flashcard.make('front', 'back')]),
                new Set([]),
                new Set([Flashcard.make('front0', 'back0'), Flashcard.make('front00', 'back00')]),
                new Set([Flashcard.make('front1', 'back1')]),
                new Set([])
            ];
            const retiredBucket = 3;

            const sequence: Array<Flashcard> = practice(day, buckets, retiredBucket);

            const correctAnswers: Array<Flashcard> = [Flashcard.make('front', 'back'), Flashcard.make('front0', 'back0'), Flashcard.make('front00', 'back00')];
            for (const answer of correctAnswers) {
                assert(sequence.includes(answer), "expected correct element");
            }
            for (const card of sequence) {
                assert(correctAnswers.includes(card), "expected all cards returned by practice to be correct");
            }
        });

    it('covers days > 1, buckets have combination of no cards and at least one card, '
        + 'all cards in same bucket, retiredBucket === buckets.length', function () {

            const day = 2;
            const buckets: Array<Set<Flashcard>> = [
                new Set([]),
                new Set([]),
                new Set([Flashcard.make('front0', 'back0'), Flashcard.make('front1', 'back1')]),
            ];
            const retiredBucket = 3;

            const sequence: Array<Flashcard> = practice(day, buckets, retiredBucket);

            assert.strictEqual(sequence.length, 0, "expected empty answer");
            assert.deepStrictEqual(sequence, [], "expected empty answer");
        });

    it('covers day > 1, buckets have combination of no cards and at least one card, '
        + 'all cards in different buckets, returedBucket > buckets.length', function () {

            const day = 8;
            const buckets: Array<Set<Flashcard>> = [
                new Set([Flashcard.make('front0', 'back0')]),
                new Set([]),
                new Set([Flashcard.make('front1', 'back1')]),
                new Set([Flashcard.make('front2', 'back2')]),
            ];
            const retiredBucket = 7;

            const sequence: Array<Flashcard> = practice(day, buckets, retiredBucket);

            const correctAnswers: Array<Flashcard> = [Flashcard.make('front0', 'back0'), Flashcard.make('front1', 'back1'), Flashcard.make('front2', 'back2')];
            for (const answer of correctAnswers) {
                assert(sequence.includes(answer), "expected correct element in sequence");
            }
            for (const card of sequence) {
                assert(correctAnswers.includes(card), "expected all cards returned by practice to be correct");
            }
        });

});

describe('update', function () {
    /*
     * Testing Strategy:
     * 
     * Partitions:
     * 
     * partition on answer: WRONG, HARD, EASY
     * partition on card's bucket: 0, > 0 and < retired bucket, === retired bucket (and !== 0)
     * partition on bucketMap card count: =1, >1 
     * partition on retiredBucket: 0, === card's bucket number in map (!== 0), > card's bucket number in map
     * 
     */

    // given test case
    it('covers easy card', function () {
        const card: Flashcard = Flashcard.make("pagh", "zero");
        const bucketMap: Map<Flashcard, number> = new Map([[card, 0]]);
        update(card, AnswerDifficulty.EASY, bucketMap, 5);
        assert.deepStrictEqual(bucketMap, new Map([[card, 1]]), "expected card to move");
    });

    it('covers EASY answer, card\'s bucket === 0, retiredBucket === 0', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.EASY;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 0]
        ]);
        const retiredBucket = 0;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 0]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected no change as card is already in retired bucket");
    });

    it('covers EASY answer, card\'s bucket === retired bucket, bucketMap card count > 1, retiredBucket === card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.EASY;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 2],
            [Flashcard.make('front1', 'back1'), 1]
        ]);
        const retiredBucket = 2;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 2],
            [Flashcard.make('front1', 'back1'), 1]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected no change as card is already in retired bucket");
    });

    it('covers EASY answer, card\'s bucket > 0 and < retired bucket, bucketMap card count = 1, retiredBucket > card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.EASY;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 2]
        ]);
        const retiredBucket = 3;
        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 3]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected correct modified map");
    });

    it('covers WRONG answer, card\'s bucket > 0 and < retired bucket, bucketMap card count >1, retiredBucket > card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.WRONG;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 1],
            [Flashcard.make('front1', 'back1'), 0],
            [Flashcard.make('front2', 'back2'), 2]
        ]);
        const retiredBucket = 3;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 0],
            [Flashcard.make('front1', 'back1'), 0],
            [Flashcard.make('front2', 'back2'), 2]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected correct modified map");
    });

    it('covers HARD answer, card\'s bucket === 0, bucketMap card count === 1, retiredBucket > card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.HARD;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 0]
        ]);
        const retiredBucket = 1;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 0]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected no change as card is already in bucket 0");
    });

    it('covers HARD answer, card\'s bucket > 0 and < retired bucket, bucketMap card count >1, retiredBucket > card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.HARD;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 3],
            [Flashcard.make('front1', 'back1'), 2]
        ]);
        const retiredBucket = 4;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 2],
            [Flashcard.make('front1', 'back1'), 2]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected correct modified bucket map");
    });

    it('covers HARD answer, card\'s bucket === retired bucket, bucketMap card count >1, retiredBucket === card\'s bucket number in map', function () {
        const card: Flashcard = Flashcard.make('front', 'back');
        const answer = AnswerDifficulty.HARD;
        const bucketMap: Map<Flashcard, number> = new Map([
            [card, 3],
            [Flashcard.make('front1', 'back1'), 2]
        ]);
        const retiredBucket = 3;

        update(card, answer, bucketMap, retiredBucket);

        const expected = new Map([
            [card, 2],
            [Flashcard.make('front1', 'back1'), 2]
        ]);
        assert.deepStrictEqual(bucketMap, expected, "expected correct change even if card was already in retired bucket");
    });

});

describe('getHint', function () {
    /*
     * Testing Strategy for Weak Spec:
     *  
     * Partitions: 
     * 
     * partition of length of word on back: 0, >0
     * 
     * 
     * 
     * Test Strategy for Stronger Spec:
     * 
     * Covers the cartesian product of these paritions:
     * 
     * Partitions:
     * 
     * partition of length of word on back: 0, 1, > 1
     * partition on parity of length of word on back: even, odd
     */

    // given test case (this technically gives "some" information, despite revealing no letters, as it tells you the length of the word on the back)
    it('covers language-vocabulary card with single-letter back', function () {
        assert.strictEqual(getHint(Flashcard.make("un", "a")), '_');
    });

    it('covers length of word on back === 0', function () {
        const card = Flashcard.make('front', "");
        const answer = getHint(card);

        assert.strictEqual(answer, undefined, "expected no possible hint here");
    });

    it('covers length of word on back to be >0', function () {
        const card = Flashcard.make('front', 'back');
        const answer = getHint(card);

        assert.notStrictEqual(answer, undefined, "expected an answer instead of undefined");

        if (answer !== undefined) {
            let hiddenCount = 0;
            for (const letter of answer) {
                if (letter === "_") {
                    hiddenCount += 1;
                }
            }

            assert.notStrictEqual(hiddenCount, 0, 'expected some of the letter to be hidden');
        }
    });

    /* Test case implementations for stronger spec below*/

    it('covers length of word on back to be 0', function () {
        const card = Flashcard.make('front', '');
        const answer = getHint(card);

        assert.strictEqual(answer, undefined, "expected no possible hint here");
    });

    it('covers length of word on back to be 1, parity is odd', function () {
        const card = Flashcard.make('front', 'b');
        const answer = getHint(card);

        const expected = "_";
        assert.strictEqual(answer, expected, "expected correct hint");
    });

    it('covers length of word on back to be >1, parity is odd', function () {
        const card = Flashcard.make('front', 'bac');
        const answer = getHint(card);

        const expected = "_a_";
        assert.strictEqual(answer, expected, "expected correct hint");
    });

    it('covers length of word on back to be >1, parity is even', function () {
        const card = Flashcard.make('front', 'back');
        const answer = getHint(card);

        const expected = "_a_k";
        assert.strictEqual(answer, expected, "expected correct hint");
    });

});

describe('computeProgress', function () {
    /*
     * Testing Strategy:
     * 
     * partition on currentState's card count per bucket:   all buckets have no cards,
     *                                                      all buckets have at least one card,  
     *                                                      buckets have combination of no cards and at least one card
     * partition by currentState's bucket distribution:     all cards in same bucket, 
     *                                                      all cards in different buckets (and # cards > 1), 
     *                                                      some cards in same bucket and some cards in different buckets
     * partition on cardHistory's number of data points per card:   all cards have only 1 past data point
     *                                                              all cards have > 1 past data point
     *                                                              cards have a combination of > 1 past data point and === 1 data point 
     */

    it("covers all buckets have no cards", function () {
        const currentState: Array<Set<Flashcard>> = [];
        const cardHistory: Map<Flashcard, Array<{ "date": Date, "bucketNum": number; }>> = new Map();

        const changesMap: Map<Flashcard, { "average": number, "median": number; }> = computeProgress(currentState, cardHistory);

        const expected = new Map();

        assert.strictEqual(changesMap.size, 0, "expected empty mapping");
        assert.deepStrictEqual(changesMap, expected, "expected an empty mapping");
    });

    it("covers all buckets have at least one card, all cards in different buckets, all cards have only 1 past data point", function () {
        const currentState: Array<Set<Flashcard>> = [
            new Set([Flashcard.make('front0', 'back0')]),
            new Set([Flashcard.make('front1', 'back1')]),
            new Set([Flashcard.make('front2', 'back2')]),
        ];
        const cardHistory: Map<Flashcard, Array<{ "date": Date, "bucketNum": number; }>> = new Map([
            [Flashcard.make('front0', 'back0'), [{ "date": new Date(2022, 0, 5), "bucketNum": 3 }]],
            [Flashcard.make('front1', 'back1'), [{ "date": new Date(2021, 4, 13, 22, 44), "bucketNum": 0 }]],
            [Flashcard.make('front2', 'back2'), [{ "date": new Date(2022, 11, 23), "bucketNum": 14 }]]
        ]);

        const changesMap: Map<Flashcard, { "average": number, "median": number; }> = computeProgress(currentState, cardHistory);

        const expected: Map<Flashcard, { "average": number, "median": number; }> = new Map([
            [Flashcard.make('front0', 'back0'), { "average": -3, "median": -3 }],
            [Flashcard.make('front1', 'back1'), { "average": 1, "median": 1 }],
            [Flashcard.make('front2', 'back2'), { "average": -12, "median": -12 }],
        ]);

        assert.deepStrictEqual(changesMap, expected, "expected a correct mapping");
    });

    it("covers buckets have combination of no cards and at least one card, all cards in same bucket, all cards have > 1 past data point", function () {
        const currentState: Array<Set<Flashcard>> = [
            new Set([]),
            new Set([]),
            new Set([Flashcard.make('front0', 'back0'), Flashcard.make('front1', 'back1'), Flashcard.make('front2', 'back2')]),
            new Set([])
        ];
        const cardHistory: Map<Flashcard, Array<{ "date": Date, "bucketNum": number; }>> = new Map([
            [Flashcard.make('front0', 'back0'), [{ "date": new Date(1832, 11, 5, 12), "bucketNum": 6 }, { "date": new Date(1754, 3, 9), "bucketNum": 0 }]],
            [Flashcard.make('front1', 'back1'), [{ "date": new Date(1997, 7, 29), "bucketNum": 7 }, { "date": new Date(2009, 4, 8), "bucketNum": 9 },
            { "date": new Date(2020, 5, 5), "bucketNum": 4 }, { "date": new Date(1995, 8, 22), "bucketNum": 0 }]],
            [Flashcard.make('front2', 'back2'), [{ "date": new Date(1109, 5, 23, 1, 32), "bucketNum": 1 }, { "date": new Date(1109, 5, 23, 1, 33), "bucketNum": 1 },
            { "date": new Date(2021, 7, 15), 'bucketNum': 8 }]]
        ]);

        const changesMap: Map<Flashcard, { "average": number, "median": number; }> = computeProgress(currentState, cardHistory);

        const expected: Map<Flashcard, { "average": number, "median": number; }> = new Map([
            [Flashcard.make('front0', 'back0'), { "average": 1, "median": 1 }],
            [Flashcard.make('front1', 'back1'), { "average": 1 / 2, "median": 0 }],
            [Flashcard.make('front2', 'back2'), { "average": 1 / 3, "median": 0 }],
        ]);

        assert.deepStrictEqual(changesMap, expected, "expected correct mapping");
    });

    it("covers buckets have combination of no cards and at least one card, some cards in same bucket and some cards in different buckets, "
        + "cards have a combination of > 1 past data point and === 1 data point", function () {
            const currentState: Array<Set<Flashcard>> = [
                new Set([Flashcard.make('front4', 'back4')]),
                new Set([]),
                new Set([Flashcard.make('front0', 'back0'), Flashcard.make('front1', 'back1'), Flashcard.make('front2', 'back2')]),
                new Set([]),
                new Set([Flashcard.make('front3', 'back3')])
            ];
            const cardHistory: Map<Flashcard, Array<{ "date": Date, "bucketNum": number; }>> = new Map([
                [Flashcard.make('front0', 'back0'), [{ "date": new Date(2021, 1, 5), "bucketNum": 2 }, { "date": new Date(2021, 2, 9), "bucketNum": 5 }]],
                [Flashcard.make('front1', 'back1'), [{ "date": new Date(1997, 7, 29), "bucketNum": 8 }, { "date": new Date(2009, 4, 8), "bucketNum": 3 },
                { "date": new Date(2020, 5, 5), "bucketNum": 7 }, { "date": new Date(1995, 8, 22), "bucketNum": 0 }]],
                [Flashcard.make('front2', 'back2'), [{ "date": new Date(1109, 5, 23), "bucketNum": 2 }, { "date": new Date(1109, 5, 26), "bucketNum": 1 },
                { "date": new Date(2021, 7, 15), 'bucketNum': 4 }]],
                [Flashcard.make('front3', 'back3'), [{ "date": new Date(2023, 2, 2), "bucketNum": 1 }]],
                [Flashcard.make('front4', 'back4'), [{ 'date': new Date(2023, 1, 2), "bucketNum": 0 }]]
            ]);

            const changesMap: Map<Flashcard, { "average": number, "median": number; }> = computeProgress(currentState, cardHistory);

            const expected: Map<Flashcard, { "average": number, "median": number; }> = new Map([
                [Flashcard.make('front0', 'back0'), { "average": 0, "median": 0 }],
                [Flashcard.make('front1', 'back1'), { "average": 1 / 2, "median": -1 / 2 }],
                [Flashcard.make('front2', 'back2'), { "average": 0, "median": -1 }],
                [Flashcard.make('front3', 'back3'), { "average": 3, "median": 3 }],
                [Flashcard.make('front4', 'back4'), { "average": 0, "median": 0 }],
            ]);

            assert.deepStrictEqual(changesMap, expected, "expected a correct mapping");
        });
});
