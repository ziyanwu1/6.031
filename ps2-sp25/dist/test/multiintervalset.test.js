"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const interval_js_1 = require("../src/interval.js");
const intervalset_js_1 = require("../src/intervalset.js");
const multiintervalset_js_1 = require("../src/multiintervalset.js");
/*
 * PS2 instructions: tests you write in this file must be runnable against any implementations that
 * follow the spec! Your tests will be run against staff implementations of MultiIntervalSet.
 *
 * Do NOT strengthen the spec of any of the tested methods.
 */
describe('MultiIntervalSet', function () {
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
    it('covers empty', function () {
        const empty = new multiintervalset_js_1.MultiIntervalSet();
        node_assert_1.default.deepStrictEqual(empty.labels(), new Set());
    });
    it('covers the empty set', function () {
        const empty = new multiintervalset_js_1.MultiIntervalSet();
        node_assert_1.default.deepStrictEqual(empty.labels(), new Set());
        node_assert_1.default.deepStrictEqual(empty.clear(), false);
    });
    it('covers start < 0, add duplicate', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(-1n, 5n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const expectedLabels = new Set("A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
    });
    it('covers start = 0, interval conflicts in the same label', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(0n, 10n);
        const interval2 = new interval_js_1.Interval(5n, 8n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const expectedLabels = new Set("A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        node_assert_1.default.throws(() => multIntervalSet.add(interval2.start, interval2.end, "A"));
    });
    it('covers start > 0, label exists and interval conflicts in a different label', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(0n, 10n);
        const interval2 = new interval_js_1.Interval(5n, 8n);
        const interval3 = new interval_js_1.Interval(15n, 100n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval3.start, interval3.end, "B");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        const intervalsOfB = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfB.add(interval3.start, interval3.end, 0);
        const expectedLabels = new Set(["A", "B"]);
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("B"), intervalsOfB);
        node_assert_1.default.throws(() => multIntervalSet.add(interval2.start, interval2.end, "B"));
        node_assert_1.default.deepStrictEqual(multIntervalSet.clear(), true);
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });
    it('covers start > 0, label doesn\'t exist and interval conflicts in a different label', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(0n, 10n);
        const interval2 = new interval_js_1.Interval(5n, 8n);
        const interval3 = new interval_js_1.Interval(15n, 100n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval3.start, interval3.end, "A");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        intervalsOfA.add(interval3.start, interval3.end, 1);
        const expectedLabels = new Set("A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        node_assert_1.default.throws(() => multIntervalSet.add(interval2.start, interval2.end, "B"));
        node_assert_1.default.deepStrictEqual(multIntervalSet.clear(), true);
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });
    it('covers start = 0, no conflicts, added_start = end in some existing interval', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(0n, 10n);
        const interval2 = new interval_js_1.Interval(10n, 15n);
        multIntervalSet.add(interval1.start, interval1.end, "A");
        multIntervalSet.add(interval2.start, interval2.end, "A");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval1.start, interval1.end, 0);
        intervalsOfA.add(interval2.start, interval2.end, 1);
        const expectedLabels = new Set("A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        node_assert_1.default.deepStrictEqual(multIntervalSet.clear(), true);
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });
    it('covers start = 0 and < 0, no conflicts, added_end = start in some existing interval', function () {
        const multIntervalSet = new multiintervalset_js_1.MultiIntervalSet();
        const interval1 = new interval_js_1.Interval(0n, 10n);
        const interval2 = new interval_js_1.Interval(-5n, 0n);
        multIntervalSet.add(interval2.start, interval2.end, "A");
        multIntervalSet.add(interval1.start, interval1.end, "A");
        const intervalsOfA = (0, intervalset_js_1.makeIntervalSet)();
        intervalsOfA.add(interval2.start, interval2.end, 0);
        intervalsOfA.add(interval1.start, interval1.end, 1);
        const expectedLabels = new Set("A");
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), expectedLabels, "labels are not the same");
        node_assert_1.default.deepStrictEqual(multIntervalSet.intervals("A"), intervalsOfA);
        node_assert_1.default.deepStrictEqual(multIntervalSet.clear(), true);
        node_assert_1.default.deepStrictEqual(multIntervalSet.labels(), new Set(), "should clear set");
    });
    // clear()
    it("covers empty clear()", function () {
        const empty = new multiintervalset_js_1.MultiIntervalSet();
        node_assert_1.default.strictEqual(empty.clear(), false);
        node_assert_1.default.deepStrictEqual(empty.labels(), new Set());
    });
    it("covers nonempty clear()", function () {
        const set = new multiintervalset_js_1.MultiIntervalSet();
        set.add(0n, 1n, "test");
        node_assert_1.default.strictEqual(set.clear(), true);
        node_assert_1.default.deepStrictEqual(set.labels(), new Set());
    });
});
//# sourceMappingURL=multiintervalset.test.js.map