/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { RegionSet } from '../src/RegionSet';
import { implementations } from '../src/RegionSetImpl';

/**
 * Tests for instance methods of {@link RegionSet}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 * 
 * Your tests MUST only obtain RegionSet instances by calling new SomeRegionSetOfString().
 * Your tests MUST NOT refer to specific concrete implementations.
 */

// Can't use makeRegionSet here, because it will only return one particular implementation.
const makeRegionSet = undefined;
// Can't refer to specific concrete implementations.
const RepMapRegionSet = undefined, RepArrayRegionSet = undefined;

/**
 * checks if two rectangles are equal
 * 
 * @param rect1  first rectangle
 * @param rect2  second rectangle
 * 
 * @returns whether or not the rectangles are equal
 */
function checkEqualRect(rect1: Rect, rect2: Rect): boolean {
    return ((rect1.x1 === rect2.x1) && (rect1.x2 === rect2.x2) && (rect1.y1 === rect2.y1) && (rect1.y2 === rect2.y2));
}


// Iterate over the different implementations and run the test suite on each of them:
implementations().forEach(SomeRegionSetOfString => describe(SomeRegionSetOfString.name, function () {
    /*
     *
     * Testing strategy for RegionSet:
     * 
     * 
     * add():
     *      partition on contigious: true, false
     *      partition on intersection: no intersection, intersect with same region, intersect with different region 
     *      partition on combined shape (union of rectangle we want to add and any intersecting region in grid): 
     *              normal rectangle, any contigious shape (but not a simple rectangle)
     * 
     * owners():
     *      partition on rect area: 0, >0 AND < (gridSize * gridSize) , gridSize * gridSize
     *      partition on number of intersecting regions in query: 0, 1, >1
     *      partition on number of total regions: 0, >0
     * 
     * bounds():
     *      partition on label existence: does exist in grid, doesn't exist in grid
     *      partition on label shape: normal rectangle, any contigious shape (not a simple rectangle)
     *      partition on rect size returned: 1, > 1 and < gridSize * gridSize, gridSize * gridSize 
     *      partition on number of regions on grid: 1, > 1     
     * 
     * 
     * See the _Testing_ reading and "Testing an abstract data type" in the _ADTs_ reading for
     * examples of what a testing strategy comment looks like.
     */


    // add() test cases:

    it("add(): no error, combined shape is normal rectangle, no intersection", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect = new Rect(2, 2, 3, 3);
        const label = "test";
        assert.doesNotThrow(function () { grid.add(label, rect); }, Error, "expected no error");
    });

    it("add(): no error, combined shape is any contigious shape, intersects with same region", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(0, 0, 5, 5);
        const rect2 = new Rect(2, 2, 10, 5);
        const label = "test";

        grid.add(label, rect1);
        assert.doesNotThrow(function () { grid.add(label, rect2); }, Error, "expected no error");
    });

    it("add(): error on discontigious region, combined shape is normal rectangle, no intersection", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(2, 2, 3, 3);
        const rect2 = new Rect(8, 8, 9, 9);
        const label = "test";
        grid.add(label, rect1);
        assert.throws(function () { grid.add(label, rect2); }, Error, "expected error thrown when label is in discontigious region");
    });

    it("add(): error on intersects with another label, combined shape is any contigious shape, intersects with different region", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(2, 2, 4, 4);
        const rect2 = new Rect(3, 3, 5, 5);
        const label1 = "test1";
        const label2 = "test2";

        grid.add(label1, rect1);
        assert.throws(function () { grid.add(label2, rect2); }, Error, "expected an error thrown when labels intersect with each other");
    });

    it("add(): adding a rectangle that isn't overlapping but touching at the right should be contiguous", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(2, 2, 3, 3);
        const rect2 = new Rect(3, 2, 4, 3);
        const label = "test1";

        grid.add(label, rect1);
        assert.doesNotThrow(function () { grid.add(label, rect2); }, Error, "expected no error");
    });

    it("add(): adding rectangle that isn't overlapping but touching at the left should be contigious", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(4, 4, 5, 5);
        const rect2 = new Rect(3, 2, 4, 7);
        const label = "test1";

        grid.add(label, rect1);
        assert.doesNotThrow(function () { grid.add(label, rect2); }, Error, "expected no error");
    });

    it("add(): adding rectangles that isn't overlapping but touching at the top should be contigious", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(2, 7, 9, 8);
        const rect2 = new Rect(6, 6, 7, 7);
        const label = "test1";

        grid.add(label, rect1);
        assert.doesNotThrow(function () { grid.add(label, rect2); }, Error, "expected no error");
    });

    it("add(): adding rectangles that isn't overlapping but touching at the bottom should be contigious", function () {
        const grid = new SomeRegionSetOfString(10);
        const rect1 = new Rect(3, 3, 4, 4);
        const rect2 = new Rect(0, 0, 9, 3);

        const label = "test1";

        grid.add(label, rect1);
        assert.doesNotThrow(function () { grid.add(label, rect2); }, Error, "expected no error");
    });


    // owners() test cases:

    it("owners(): rect area = 0 (doesn't intersect by at least one full cell)", function () {
        const grid = new SomeRegionSetOfString(10);
        grid.add("test", new Rect(0, 0, 10, 10));

        const rectQuery = new Rect(2, 2, 2, 2);
        assert.deepStrictEqual(grid.owners(rectQuery), new Set(), "expected empty result when the rect query has an area of 0");
    });

    it("owners(): number of total regions = 0", function () {
        const grid = new SomeRegionSetOfString(10);
        const rectQuery = new Rect(2, 2, 7, 6);
        assert.deepStrictEqual(grid.owners(rectQuery), new Set(), "expected empty result when the total number of regions are 0");
    });

    it("owners(): rect area is > 0 AND < (gridSize * gridSize), number of intersecting regions in query = 0, number of total regions > 0", function () {
        const grid = new SomeRegionSetOfString(10);
        grid.add("test1", new Rect(0, 0, 2, 2));
        grid.add("test2", new Rect(7, 7, 10, 8));

        const rectQuery = new Rect(3, 3, 6, 6);
        assert.deepStrictEqual(grid.owners(rectQuery), new Set(), "expected empty result when there are no intersecting regions in query");
    });

    it("owners(): rect area is > 0 AND < (gridSize * gridSize), number of intersecting regions in query = 1, number of total regions > 0", function () {
        const grid = new SomeRegionSetOfString(10);
        grid.add("test1", new Rect(0, 0, 2, 2));
        grid.add("test2", new Rect(7, 7, 10, 9));

        const rectQuery = new Rect(6, 6, 8, 8);
        assert.deepStrictEqual(grid.owners(rectQuery), new Set(["test2"]), "expected correct label in returned set when there's only one intersecting region");
    });

    it("owners(): rect area is gridSize * gridSize, number of intersecting regions in query > 1, number of total regions > 0", function () {
        const grid = new SomeRegionSetOfString(10);
        grid.add("test1", new Rect(0, 0, 2, 2));
        grid.add("test2", new Rect(3, 3, 4, 4));
        grid.add("test3", new Rect(5, 5, 7, 8));
        grid.add("test4", new Rect(8, 8, 10, 9));

        const rectQuery = new Rect(0, 0, 10, 10);
        assert.deepStrictEqual(grid.owners(rectQuery), new Set(["test1", "test2", "test3", "test4"]), "expected all labels to be returned in set when rect query is the entire grid");
    });


    // bounds() test cases:

    it("bounds(): label exists in grid, shape is normal rectangle, rect size returned = 1, number of regions in grid = 1", function () {
        const grid = new SomeRegionSetOfString(10);
        const label = "test1";
        const rect = new Rect(3, 3, 4, 4);
        grid.add(label, rect);

        const bounds = grid.bounds(label);
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        assert(checkEqualRect(bounds, rect), "expected returned rect to be the simple rectangle encompassing the region");
    });

    it("bounds(): label exists in grid, shape is normal rectangle, rect size returned > 1, number of regions in grid = 1", function () {
        const grid = new SomeRegionSetOfString(9);
        const label = "test1";
        const rect = new Rect(7, 3, 8, 5);
        grid.add(label, rect);

        const bounds = grid.bounds(label);
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        assert(checkEqualRect(bounds, rect), "expected returned rect to be the simple rectangle encompassing the region");
    });

    it("bounds(): label exists in grid, shape is any contigious shape, rect size returned is > 1 and < gridSize * gridSize, number of regions in grid > 1", function () {
        const grid = new SomeRegionSetOfString(10);
        const label = "test1";
        const rect1 = new Rect(2, 2, 7, 6);
        const rect2 = new Rect(2, 2, 8, 4);
        const rect3 = new Rect(0, 0, 3, 3);
        grid.add(label, rect1);
        grid.add(label, rect2);
        grid.add(label, rect3);

        const bounds = grid.bounds(label);
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        const rect_result = new Rect(0, 0, 8, 6);
        assert(checkEqualRect(bounds, rect_result), "expected smallest rectangle to encompass all cells in label");
    });

    it("bounds(): label exists in grid, shape is any contigious shape, rect size returned = gridSize * gridSize, number of regions in grid > 1", function () {
        const grid = new SomeRegionSetOfString(4);
        const label = "test1";
        grid.add(label, new Rect(0, 0, 2, 4));
        grid.add(label, new Rect(0, 0, 4, 2));
        grid.add(label, new Rect(0, 2, 4, 4));
        grid.add(label, new Rect(1, 1, 4, 4));

        const bounds = grid.bounds(label);
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        const rect_result = new Rect(0, 0, 4, 4);
        assert(checkEqualRect(bounds, rect_result), "expected bounds rectangle to encompass the entire grid");
    });

    it("bounds(): label doesn't exist in grid", function () {
        const grid = new SomeRegionSetOfString(10);
        const labelQuery = "test";

        const bounds = grid.bounds(labelQuery);
        assert.strictEqual(bounds, undefined, "expected undefined for nonexistent label");
    });

}));
