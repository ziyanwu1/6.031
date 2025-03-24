"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const intervalset_impls_js_1 = require("../src/intervalset-impls.js");
// Do not use makeIntervalSet here, because it will only return one particular implementation.
const makeIntervalSet = undefined;
// Do not refer to specific concrete implementations.
const RepMapIntervalSet = undefined, RepArrayIntervalSet = undefined;
/*
 * PS2 instructions: tests you write in this file must be runnable against any implementations that
 * follow the spec! Your tests will be run against staff implementations of IntervalSet.
 *
 * Do NOT strengthen the spec of any of the tested methods.
 * Your tests MUST call `new SomeIntervalSet` to obtain IntervalSet instances, NOT makeIntervalSet.
 * Your tests MUST NOT refer to specific concrete implementations.
 */
(0, intervalset_impls_js_1.implementationsForTesting)().forEach(SomeIntervalSet => describe(SomeIntervalSet.name, function () {
    /*
     * Testing strategy for IntervalSet
     *
     * TODO
     *
     * See the _Testing_ reading and "Testing an abstract data type" in the _ADTs_ reading for
     * examples of what a testing strategy comment looks like.
     *
     * testing strategy for each operation of IntervalSet
     *
     * add:
     *    partition on start: < 0, = 0, > 0
     *    end: > start
     *    partition on label:
     *      - doesn't exist in set and doesn't overlap with another label (tested when adding initial label)
     *        - added start = end in some existing interval (uses this)
     *        -
     *      - exists in set and interval is [start, end)
     *      - exists in set and interval isn't [start, end) (conflict)
     *      - overlaps with a different label of interval [start, end) (conflict)
     *
     * labels:
     *    no partition; must return all the labels in the set
     *
     * interval:
     *    partition on label: exists in the set, doesn't exist in the set
     *
     */
    it('covers "this" is an empty set', function () {
        // TODO you may use, change, or remove this test;
        //   remember to write the partitions covered in the test name
        const empty = new SomeIntervalSet();
        node_assert_1.default.deepStrictEqual(empty.labels(), new Set());
    });
    // label doesn\'t exist in set and add duplicate
    // it('"this" won\'t be an empty set, covers start < 0, add duplicate', function() {
    //     const oneValue = new SomeIntervalSet<string>();
    //     oneValue.add(-1n, 10n, "A");
    //     const result = new Set<[string, [bigint, bigint]]>();
    //     result.add(["A", [-1n, 10n]]);
    //     assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
    //     oneValue.add(-1n, 10n, "A");
    //     assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
    // });
    // it('"this" won\'t be an empty set, covers start = 0, add label with conflicting interval', function() {
    //     const oneValue = new SomeIntervalSet<string>();
    //     oneValue.add(0n, 10n, "A");
    //     const result = new Set<[string, [bigint, bigint]]>();
    //     result.add(["A", [-1n, 10n]]);
    //     assert.throws(() => { oneValue.add(0n, 15n, "A"); });
    //     assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
    // });
    // it('"this" won\'t be an empty set, covers start > 0, label doesn\'t exist in set but has conflicting interval', function() {
    //     const oneValue = new SomeIntervalSet<string>();
    //     oneValue.add(0n, 10n, "A");
    //     const result = new Set<[string, [bigint, bigint]]>();
    //     result.add(["A", [-1n, 10n]]);
    //     assert.throws(() => { oneValue.add(1n, 15n, "B"); });
    //     assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
    // });
    // TODO other tests for IntervalSet;
    //   always use `new SomeIntervalSet<string>()` to obtain new IntervalSets
    /*
        it('covers "this" is an empty set', function() {
            // TODO you may use, change, or remove this test;
            //   remember to write the partitions covered in the test name
            const empty = new SomeIntervalSet<string>();
            assert.deepStrictEqual(empty.labels(), new Set());
        });
        // label doesn\'t exist in set and add duplicate
        it('"this" produced by add, covers start < 0, add duplicate', function() {
            const oneValue = new SomeIntervalSet<string>();
            oneValue.add(-1n, 10n, "A");
            const result = new Set<[string, [bigint, bigint]]>();
            result.add(["A", [-1n, 10n]]);
            assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
            oneValue.add(-1n, 10n, "A");
            assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
        });
    
        it('"this" produced by add, covers start = 0, add label with conflicting interval', function() {
            const oneValue = new SomeIntervalSet<string>();
            oneValue.add(0n, 10n, "A");
            const result = new Set<[string, [bigint, bigint]]>();
            result.add(["A", [-1n, 10n]]);
            assert.throws(() => { oneValue.add(0n, 15n, "A"); });
            assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
        });
    
        it('"this" produced by constructor, covers start > 0, label doesn\'t exist in set but has conflicting interval', function() {
            const oneValue = new SomeIntervalSet<string>(0n, 10n, "A");
            const result = new Set<[string, [bigint, bigint]]>();
            result.add(["A", [-1n, 10n]]);
            assert.throws(() => { oneValue.add(1n, 15n, "B"); });
            assert.deepStrictEqual(oneValue.labels(), {"A": [-1n, 10n]});
        });
    */
}));
//# sourceMappingURL=intervalset.test.js.map