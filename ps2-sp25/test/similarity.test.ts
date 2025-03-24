/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'node:assert';
import { Interval } from '../src/interval.js';
import { IntervalSet, IntervalConflictError, makeIntervalSet } from '../src/intervalset.js';
import { MultiIntervalSet } from '../src/multiintervalset.js';
import { similarity, DualInterval, LabelSimilarity } from '../src/similarity.js';
import * as utils from '../src/utils.js';

/*
 * Tests for the similarity module.
 */

describe('similarity', function() {

    it('covers empty', function() {
        const result = similarity([], new MultiIntervalSet<string>(), new MultiIntervalSet<string>());
        assert.strictEqual(0, result);
    });

    it("given example", function () {
        // A: { "happy" = [[0, 1), [2,4)], "sad" = [[1,2)] } 
        // B: { "sad" = [[1, 2)], "meh" = [[2,3)], "happy" = [[3,4)] }
        // similarities: [ ["happy","meh",0.5], ["meh","sad",0.5] ]
        // 
        // = 0.625

        const setA = new MultiIntervalSet<string>();
        setA.add(0n, 1n, "happy");
        setA.add(1n, 2n, "sad");
        setA.add(2n, 4n, "happy");

        const setB = new MultiIntervalSet<string>();
        setB.add(1n, 2n, "sad");
        setB.add(2n, 3n, "meh");
        setB.add(3n, 4n, "happy");

        const similarities: LabelSimilarity[] = [ ["happy", "meh", 0.5], ["meh", "sad", 0.5]];
        assert.strictEqual(similarity(similarities, setA, setB), 0.625);
    })

});

describe('DualInterval', function() {

    /*
     * Testing strategy for TODO ADT
     *
     * TODO
     */

    it('covers nothing', function() {
        // TODO remember to write the partitions covered in the test name
        // new DualInterval(); // TODO
    });

});
