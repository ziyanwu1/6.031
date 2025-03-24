/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { City } from '../src/City';

/**
 * Tests for instance methods of {@link City}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 */

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

describe('City', function () {
    /*
     * 
     * Testing strategy for City
     * 
     * 
     * expand():
     *      partition on error: no error, error on discontigious region, error on intersects with another region, error on ungrounded
     *      partition on combined shape (union of rectangle we want to add and any intersecting region in 2d grid): normal rectangule, any contiguous 2d shape
     *      partition on intersection (when projected on the 2d plane): no intersection, intersect with same region, intersect with different region
     *      partition on z-level of region: 0, > 0
     *      partition on the building's region location: all regions on same floor level, all on different floor levels, some on same and different floors
     * 
     * owners():
     *      partition on rect area: 0, >0 AND < (gridSize * gridSize) , gridSize * gridSize
     *      partition on number of intersecting regions in query: 0, 1, > 1
     *      partition on number of total regions: 0, > 0
     *      partition on location of owner regions: all on the same floor, all on different floors, some are same floors and some are different floors
     * 
     * bounds():
     *      partition on label existence: does exist in grid, doesn't exist in grid
     *      partition on label's region's shape: normal rectangular prism, any contiguous shape
     *      partition on height: 1, > 1 and < gridsize, gridSize
     *      partition on rect size returned: 1, > 1 and < gridSize * gridSize, gridSize * gridSize 
     *      partition on number of regions on grid: 1, > 1
     * 
     */


    // expand() test cases:

    it("expand(): no error, combined shape is normal rectangle, no intersection, z-level = 0", function () {
        const world = new City<string>(10);
        const label = "test";
        const floor = 0;
        const rect = new Rect(2, 3, 7, 8);

        assert.doesNotThrow(function () { world.expand(label, floor, rect); }, Error,
            "expected no error");
    });

    it("expand(): no error, combined shape is any contiguous 2d shape, \
    intersect with same region, z-level > 1, some regions on same and different floor levels", function () {
        const world = new City<string>(10);
        const label = "test";
        world.expand(label, 0, new Rect(0, 0, 10, 10));

        assert.doesNotThrow(function () { world.expand(label, 1, new Rect(2, 3, 6, 7)); }, Error,
            "expected no error when adding region on top");
        assert.doesNotThrow(function () { world.expand(label, 1, new Rect(4, 4, 9, 10)); }, Error,
            "expected no error when adding region to same label");
    });

    it("expand(): error on discontiguous region, no intersection, \
    z-level = 0, all regions are on the same floor level", function () {
        const world = new City<string>(10);
        const label = "test1";
        world.expand(label, 0, new Rect(0, 0, 2, 2));

        assert.throws(function () { world.expand(label, 0, new Rect(6, 6, 7, 8)); }, Error,
            "expected error thrown when the label's region is uncontiguous (horizontally)");
    });

    it("expand(): error on discontiguous region, combined shape is normal rectangle, intersect with same label, \
    z-level > 1, all regions on different floor level", function () {
        const world = new City<string>(10);
        const label = "test1";
        world.expand(label, 0, new Rect(3, 3, 5, 5));

        assert.throws(function () { world.expand(label, 2, new Rect(3, 3, 5, 5)); }, Error,
            "expeceted error thrown when the label's region is uncontiguous (vertically)");
    });

    it("expand(): error on discontiguous region, no intersection, z-level > 1, \
    all regions on different floor levels", function () {
        const world = new City<string>(10);
        const label = "test1";
        world.expand(label, 0, new Rect(0, 0, 1, 1));

        assert.throws(function () { world.expand(label, 1, new Rect(5, 5, 6, 8)); }, Error,
            "expected error thrown when the label's region is uncontiguous (both vertically and horizontally)");
    });


    it("expand(): error on intersects with another region, combined shape is any contigious 2d shape, \
    intersect with different region, z-level = 0, all regions on the same floor level", function () {
        const world = new City<string>(9);
        world.expand("test1", 0, new Rect(0, 0, 5, 6));

        assert.throws(function () { world.expand("test2", 0, new Rect(3, 0, 8, 9)); }, Error,
            "expected error thrown when labels intersect each other");
    });

    it("expand(): error on intersects with another region, combined shape is a normal rectangle, \
    intersect with different region, z-level > 1, some regions on same and different floors", function () {
        const world = new City<string>(10);
        const label1 = "test1";
        const label2 = "test2";

        world.expand(label1, 0, new Rect(0, 0, 5, 10));
        world.expand(label2, 0, new Rect(5, 0, 10, 10));

        world.expand(label1, 1, new Rect(2, 2, 7, 7));
        assert.throws(function () { world.expand(label2, 1, new Rect(2, 2, 7, 7)); }, Error,
            "expected error thrown when labels intersect one another");
    });

    it("expand(): error on ungrounded, combined shape is a normal rectangle, no intersection, \
    z-level > 1, all regions on same floor", function () {
        const world = new City<string>(10);

        assert.throws(function () { world.expand("test", 1, new Rect(2, 2, 3, 3)); }, Error, "expected error when region is ungrounded");
    });

    it("expand(): error on ungrounded, intersect with same label, z-level > 1, all regions on same floors", function () {
        const world = new City<string>(10);

        assert.throws(function () { world.expand("test", 1, new Rect(2, 3, 7, 8)); }, Error, "expected ungrounded error");
        assert.throws(function () { world.expand("test", 1, new Rect(0, 0, 10, 10)); }, Error, "expected ungrounded error");
    });


    // owners() test cases:

    it("owners(): number of tatal regions = 0", function () {
        const world = new City<string>(10);

        assert.deepStrictEqual(world.owners(new Rect(0, 0, 10, 10)), new Set(),
            "expected no owners when there's no regions anywhere");
    });

    it("owners(): rect area = 0 (never intersects by one full cell)", function () {
        const world = new City<string>(10);
        world.expand("test", 0, new Rect(0, 0, 10, 10));

        const rect = new Rect(2, 2, 2, 2);

        assert.deepStrictEqual(world.owners(rect), new Set(),
            "expected no owners when query has area 0");
    });

    it("owners(): rect area > 0 and < (gridSize * gridSize), number of intersecting regions = 1, \
    total regions > 0, location of owner regions all on the same floor", function () {
        const world = new City<string>(10);
        const label = "test";
        const rectQuery = new Rect(7, 7, 9, 9);
        world.expand(label, 0, new Rect(0, 0, 5, 10));
        world.expand(label, 1, new Rect(4, 0, 10, 10));
        world.expand("test2", 0, new Rect(6, 0, 9, 2));

        assert.deepStrictEqual(world.owners(rectQuery), new Set(["test"]),
            "expected there to be only one owner in this query");
    });

    it("owners(): rect area = (gridSize * gridSize), number of intersecting regions > 1, number of total regions > 0, \
    location of owner regions have some on same and different floors", function () {
        const world = new City<string>(10);
        const label1 = "test1";
        const label2 = "test2";
        const label3 = "test3";
        const rectQuery = new Rect(0, 0, 10, 10);

        world.expand(label1, 0, new Rect(0, 0, 5, 10));
        world.expand(label2, 0, new Rect(5, 0, 10, 5));
        world.expand(label3, 0, new Rect(5, 5, 10, 10));
        world.expand(label1, 1, new Rect(0, 0, 1, 10));
        world.expand(label2, 1, new Rect(1, 0, 7, 10));
        world.expand(label3, 1, new Rect(7, 0, 10, 10));

        assert.deepStrictEqual(world.owners(rectQuery), new Set(["test1", "test2", "test3"]),
            "expected every label to be included in the set");
    });

    it("owners(): rect area > 0 AND < (gridSize * gridSize), number of interseting regions = 0, \
    number of total regions > 0", function () {
        const world = new City<string>(10);
        const label1 = "test1";
        const label2 = "test2";
        const rectQuery = new Rect(4, 4, 6, 6);

        world.expand(label1, 0, new Rect(0, 0, 3, 3));
        world.expand(label2, 0, new Rect(7, 7, 10, 10));
        world.expand(label1, 1, new Rect(1, 1, 3, 3));
        world.expand(label2, 1, new Rect(7, 7, 9, 9));

        assert.deepStrictEqual(world.owners(rectQuery), new Set(), "expected no owners in this region");
    });

    it("owners(): rect area > 0 AND < (gridSize * gridSize), number of intersecting regions in query > 1, \
    total regions > 0, location of owner regions are all on different floors", function () {
        const world = new City<string>(11);
        const label1 = "test1";
        const label2 = "test2";
        const label3 = "test3";
        const rectQuery = new Rect(2, 0, 4, 4);

        world.expand(label1, 0, new Rect(0, 0, 5, 10));
        world.expand(label2, 0, new Rect(5, 0, 9, 10));
        world.expand(label3, 0, new Rect(9, 0, 10, 10));
        world.expand(label1, 1, new Rect(0, 0, 2, 10));
        world.expand(label2, 1, new Rect(2, 0, 9, 10));
        world.expand(label3, 1, new Rect(9, 0, 10, 10));
        world.expand(label3, 2, new Rect(0, 0, 10, 10));

        assert.deepStrictEqual(world.owners(rectQuery), new Set(["test1", "test2", "test3"]),
            "expected all regions to be returned");
    });


    // bounds() test cases:

    it("bounds(): label does exist in grid, shape is normal rectangular prism, height is 1, \
    rect size returned is 1, number of regions on grid is = 1", function () {
        const world = new City<string>(10);
        const rect = new Rect(2, 2, 3, 3);

        world.expand("test", 0, rect);

        const bounds = world.bounds("test");
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        assert(checkEqualRect(bounds['footprint'], rect), "expected returned rect to be the same rectangle given");
        assert.strictEqual(bounds['height'], 1, "expected correct height of minimium bounds");
    });

    it("bounds(): label does exist in grid, shape is any contiguous region, height > 1 and < gridSize, \
    rect size returned is > 1 and < gridSize * gridSize, number of regions on grid is > 1", function () {
        const world = new City<string>(10);

        world.expand("test", 0, new Rect(2, 2, 7, 7));
        world.expand("test", 1, new Rect(3, 3, 6, 6));
        world.expand("test", 2, new Rect(1, 1, 5, 9));

        const bounds = world.bounds("test");
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        assert(checkEqualRect(bounds['footprint'], new Rect(1, 1, 7, 9)),
            "expected returned rect to be cover all rects in labeled region");
        assert.strictEqual(bounds['height'], 3, "expected correct number of floors");
    });

    it("bounds(): label does exist in grid, shape is any contiguous region, height = gridSize, \
    rect size = gridSize * gridSize, number of regions on grid is > 1", function () {
        const world = new City<string>(4);

        world.expand("test", 0, new Rect(0, 0, 4, 4));
        world.expand("test", 1, new Rect(1, 1, 3, 3));
        world.expand("test", 2, new Rect(1, 0, 2, 3));
        world.expand("test", 3, new Rect(0, 0, 4, 4));

        const bounds = world.bounds("test");
        if (bounds === undefined) {
            assert.fail("expected bounds to not be undefined");
        }

        assert(checkEqualRect(bounds["footprint"], new Rect(0, 0, 4, 4)),
            "expected bounds to be entire 2d rectangle space");
        assert.strictEqual(bounds["height"], 4, "expected correct number for height");
    });

    it("bounds(): label doesn't exist in grid", function () {
        const world = new City<string>(7);

        world.expand("test", 0, new Rect(2, 2, 7, 7));
        world.expand("test", 1, new Rect(3, 3, 6, 6));
        world.expand("test", 2, new Rect(1, 1, 5, 4));

        assert.strictEqual(world.bounds("notest"), undefined, "expected undefined for nonexistent label");
    });
});
