/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'node:assert';
import { Interval } from '../src/interval.js';
import { IntervalSet, IntervalConflictError, makeIntervalSet } from '../src/intervalset.js';
import { MultiIntervalSet } from '../src/multiintervalset.js';
import * as utils from '../src/utils.js';

/*
 * PS2 instructions: tests you write in this file must be runnable against any implementations that
 * follow the spec! Your tests will be run against staff implementations of MultiIntervalSet.
 * 
 * Do NOT strengthen the spec of any of the tested methods.
 */

describe('MultiIntervalSet', function() {
    /*
     * Testing strategy for MultiIntervalSet
     *
     *
     * See the _Testing_ reading and "Testing an abstract data type" in the _ADTs_ reading for
     * examples of what a testing strategy comment looks like.
     *
     * testing strategy for each operation of MultiIntervalSet
     * 
     * add:
     *    partition on start: < 0, = 0, > 0
     *    end: > start
     *    partition on label:
     *       - doesn't exist in set and doesn't overlap with another label
     *         - added_start = end in some existing interval
     *         - added_end = start in some existing interval
     *       - exists in set and interval is [start, end)
     *       - exists in set and interval conflicts with different, overlapping interval of the same label
     *       - exists in set and interval conflicts with different, overlapping interval of another label
     *       - doesn't exist in set and overlaps with another label/interval
     * 
     * clear:
     *    `this` is empty, nonempty
     *
     * intervals:
     *    partition on label: label has 0, 1, >1 intervals
     *
     * labels:
     *    no partition; must return all the labels in the set (or none if they don't exist)
     */

    it('covers empty', function() {
        const empty = new MultiIntervalSet<string>();
        assert.deepStrictEqual(empty.labels(), new Set());
    });

    it('covers the empty set', function() {
        const empty = new MultiIntervalSet<string>();
        assert.deepStrictEqual(empty.labels(), new Set());
        assert.deepStrictEqual(empty.clear(), false);
    });

    it('covers start < 0, add duplicate', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(-1n, 5n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const expectedLabels = new Set("A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
    });

    it('covers start = 0, interval conflicts in the same label', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(0n, 10n);
        const interval2 = new Interval(5n, 8n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const expectedLabels = new Set("A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        assert.throws(() => multIntervalSet.add(interval2.start, interval2.end, "A"));
    });

    it('covers start > 0, label exists and interval conflicts in a different label', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(0n, 10n);
        const interval2 = new Interval(5n, 8n);
        const interval3 = new Interval(15n, 100n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval3.start, interval3.end, "B");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const intervalsOfB = makeIntervalSet<number>();
        intervalsOfB.add(interval3.start, interval3.end, 0);
        const expectedLabels = new Set(["A", "B"]);
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        assert.deepStrictEqual(multIntervalSet.intervals("B"), intervalsOfB);
        assert.throws(() => multIntervalSet.add(interval2.start, interval2.end, "B"));
        assert.deepStrictEqual(multIntervalSet.clear(), true);
        assert.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });

    it('covers start > 0, label doesn\'t exist and interval conflicts in a different label', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(0n, 10n);
        const interval2 = new Interval(5n, 8n);
        const interval3 = new Interval(15n, 100n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval3.start, interval3.end, "A");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        intervalsOfA.add(interval3.start, interval3.end, 1);
        const expectedLabels = new Set("A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        assert.throws(() => multIntervalSet.add(interval2.start, interval2.end, "B"));
        assert.deepStrictEqual(multIntervalSet.clear(), true);
        assert.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });

    it('covers start = 0, no conflicts, added_start = end in some existing interval', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(0n, 10n);
        const interval2 = new Interval(10n, 15n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval2.start, interval2.end, "A");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        intervalsOfA.add(interval2.start, interval2.end, 1);
        const expectedLabels = new Set("A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        assert.deepStrictEqual(multIntervalSet.clear(), true);
        assert.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });

    it('covers start = 0 and < 0, no conflicts, added_end = start in some existing interval', function() {
        const multIntervalSet = new MultiIntervalSet<string>();
        const interval1 = new Interval(0n, 10n);
        const interval2 = new Interval(-5n, 0n);
        multIntervalSet.add(interval2.start, interval2.end, "A");
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = makeIntervalSet<number>();
        intervalsOfA.add(interval2.start, interval2.end, 0);
        intervalsOfA.add(interval1.start, interval1.end, 1);
        const expectedLabels = new Set("A");
        assert.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        assert.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        assert.deepStrictEqual(multIntervalSet.clear(), true);
        assert.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });


    // clear()

    it("covers empty clear()", function () {
        const empty = new MultiIntervalSet<string>();
        assert.strictEqual(empty.clear(), false);
        assert.deepStrictEqual(empty.labels(), new Set());
    });

    it("covers nonempty clear()", function () {
        const set = new MultiIntervalSet<string>();
        set.add(0n, 1n, "test");
        assert.strictEqual(set.clear(), true);
        assert.deepStrictEqual(set.labels(), new Set());
    });

});
