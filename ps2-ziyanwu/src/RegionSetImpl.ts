/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RegionSet } from './RegionSet';
import * as utils from './utils';

/**
 * An implementation of RegionSet.
 * 
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
export class RepMapRegionSet<L> implements RegionSet<L> {

    private readonly map: Map<L, Array<Rect>> = new Map();

    // Abstraction function:
    //      AF(map, gridSize) = a grid with 'gridSize * gridSize' number of cells. the grid is represented by 'map' which is
    //                          a Map that has the different labels as keys which each key corresponds to an Array of Rects that belong to that label
    // Representation invariant:
    //      gridSize >= 0
    //      map stores a mapping between a label of any type comparable with '===' to an array of valid Rects
    //          * a valid Rect has x1 <= x2 and y1 <= y2, nonzero area, and integer coordinates from [0,'gridSize']
    //          * the array of Rects must be one contigious shape when all Rects for a label are superimposed
    //          * the array of Rects for a label can't have any overlap with the array of Rects for every other label in the map
    //              - in other words, intersection between a label's area and every other label's area is the empty set
    // Safety from rep exposure:
    //      map is private and readonly, only accessible through class methods
    //      map isn't aliased in any of our return values for our class methods
    //      gridSize is readonly and immutable


    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        this.checkRep();
    }


    /**
     * helper function to see if a rectangle is a valid rectangle
     * 
     * @param rect  the rectangle we want to check
     */
    private isValidRect(rect: Rect): void {

        const nonzeroArea: boolean = (rect.x1 !== rect.x2) && (rect.y1 !== rect.y2);
        assert(nonzeroArea, "expected a non-zero area rectangle");

        const points: Array<number> = [rect.x1, rect.x2, rect.y1, rect.y2];

        for (const point of points) {
            assert(point >= 0 && point <= this.gridSize, "expected corner x or y values to be withing [0, gridSize]");
        }

        for (const point of points) {
            assert(point === Math.floor(point), "expected an integer corner x or y value");
        }
    }


    /**
     * helper function to see if two rectangles are overlapping
     * 
     * @param rect1  a rectangle
     * @param rect2  another rectangle
     * 
     * @returns whether or not the rectangles overlap
     */
    private areRectsOverlapping(rect1: Rect, rect2: Rect): boolean {
        for (let x = rect1.x1; x < rect1.x2; x++) {
            for (let y = rect1.y1; y < rect1.y2; y++) {
                if ((x >= rect2.x1) && (x < rect2.x2) && (y >= rect2.y1) && (y < rect2.y2)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * helper function to see if two rectangles are bordering
     * two rectangles are bordering if they do not overlap and share at least one edge
     * 
     * @param rect1  a rectangle (the base rectangle we look at)
     * @param rect2  another rectangle
     * 
     * @returns whether or not the rectangles are touching
     */
    private areRectsBordering(rect1: Rect, rect2: Rect): boolean {
        // checks whether borders of each rectangle are touching on the same axis
        const leftBorder: boolean = (rect1.x1 === rect2.x2);
        const rightBorder: boolean = (rect1.x2 === rect2.x1);
        const topBorder: boolean = (rect1.y2 === rect2.y1);
        const bottomBorder: boolean = (rect1.y1 === rect2.y2);

        // checks whether borders are also in the correct range
        let inXRange = false;
        for (let i = rect2.x1; i < rect2.x2; ++i) {
            if (i >= rect1.x1 && i < rect1.x2) {
                inXRange = true;
                break;
            }
        }

        let inYRange = false;
        for (let i = rect2.y1; i < rect2.y2; ++i) {
            if (i >= rect1.y1 && i < rect1.y2) {
                inYRange = true;
                break;
            }
        }

        return ((leftBorder || rightBorder) && inYRange) || ((topBorder || bottomBorder) && inXRange);
    }


    /**
     * helper function to see if our current label has any overlap in area with any other label
     * 
     * @param currentLabel  the label we want to check for overlaps of
     * 
     * @returns whether or not the label is overlapping with any other label
     */
    private isAnyOverlap(currentLabel: L): boolean {
        const currentArr = this.map.get(currentLabel) ?? [];
        for (const rect1 of currentArr) {
            for (const label of this.map.keys()) {
                const labelArr = this.map.get(label) ?? [];
                for (const rect2 of labelArr) {
                    if (this.areRectsOverlapping(rect1, rect2) && (label !== currentLabel)) {
                        return true;
                    }
                }

            }
        }
        return false;
    }


    /**
     * check if all the rectangles in an array are contiguous
     * 
     * @param rectArr  an array of Rects
     * @returns  whether or not all the rectangles make a contiguous shape
     */
    private areAllConnected(rectArr: Array<Rect>): boolean {
        for (let i = 0; i < rectArr.length; i++) {
            let flag = false;

            for (let j = 0; j < i; j++) {

                const rect1 = rectArr[i];
                const rect2 = rectArr[j];

                if (rect1 === undefined) {
                    assert.fail("expected non undefined rectangle in rectArr");
                }
                if (rect2 === undefined) {
                    assert.fail("expected non undefined rectangle in rectArr");
                }

                this.isValidRect(rect1);
                this.isValidRect(rect2);

                if (this.areRectsOverlapping(rect1, rect2) || this.areRectsBordering(rect1, rect2)) {
                    flag = true;
                    break;
                }

            }
            if (!flag && (i !== 0)) {
                return false;
            }
        }
        return true;
    }


    /**
     * Checks that the rep invariant is true
     */
    private checkRep(): void {
        assert(this.gridSize >= 0);
        for (const label of this.map.keys()) {
            assert(!this.isAnyOverlap(label), "expected no overlap between two different label regions");
            const rectArr = this.map.get(label) ?? [];
            assert(this.areAllConnected(rectArr), "expected a contiguous area for a label region");
        }
    }


    /**
     * @inheritDoc
     */
    public add(label: L, rect: Rect): void {
        this.isValidRect(rect);

        const labelArr: Array<Rect> = this.map.get(label) ?? [];
        labelArr.push(rect);
        this.map.set(label, labelArr);


        if (this.isAnyOverlap(label)) {
            throw new Error("you're trying to add a rect to a place that already contains another label region");
        }

        if (!this.areAllConnected(labelArr)) {
            throw new Error("you're trying to add a rect that will cause the label to be uncontigious");
        }

        this.checkRep();
    }


    /**
     * @inheritDoc
     */
    public owners(rect: Rect): Set<L> {

        const rectOwners: Set<L> = new Set();

        for (const label of this.map.keys()) {
            const labelArr = this.map.get(label) ?? [];
            for (const labelRect of labelArr) {
                if (this.areRectsOverlapping(rect, labelRect)) {
                    rectOwners.add(label);
                    break;
                }
            }
        }

        this.checkRep();
        return rectOwners;
    }


    /**
     * @inheritDoc
     */
    public bounds(label: L): Rect | undefined {
        const labelArr = this.map.get(label);
        if (labelArr === undefined) {
            return undefined;
        }

        let minX1: number = this.gridSize;
        let minY1: number = this.gridSize;
        let maxX2 = 0;
        let maxY2 = 0;

        for (const rect of labelArr) {
            if (rect.x1 < minX1) {
                minX1 = rect.x1;
            }
            if (rect.y1 < minY1) {
                minY1 = rect.y1;
            }
            if (rect.x2 > maxX2) {
                maxX2 = rect.x2;
            }
            if (rect.y2 > maxY2) {
                maxY2 = rect.y2;
            }
        }

        this.checkRep();
        return new Rect(minX1, minY1, maxX2, maxY2);
    }


    /**
     * @inheritDoc
     */
    public toString(): string {
        const firstLine = `Region (gridSize = ${this.gridSize}):\n`;
        let body = ``;
        for (const [label, labelArr] of this.map.entries()) {
            const line = `${label}: ${labelArr}\n`;
            body += line;
        }
        return firstLine + body;
    }

}


/**
 * An implementation of RegionSet.
 * 
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
export class RepArrayRegionSet<L> implements RegionSet<L> {

    private readonly array: Array<L | undefined> = [];

    // Abstraction function: 
    //      AF(array, gridSize) =  a grid with 'gridSize * gridSize' number of cells. The grid is represented by 'array' which is
    //                             an array where each index corresponds to a location on the grid. A Rect in an index means that 
    //                             the Rect is in that corresponding position in the grid. 
    //                             
    //                             The exact formula for the translation is:
    //                                  for a grid position (x,y):  x = index % gridSize, y = Math.floor(index / gridSize)
    // Representation invariant:
    //      gridSize >= 0
    //      array stores an array of region labels, where the index of a label means that that grid cell position belongs to that label
    //          * a label's area on the grid must be contigious
    //          * all grid cells can ONLY belong to one label 
    //          * array length is <= gridSize * gridSize
    // Safety from rep exposure:
    //      array is private and readonly, only accesible through class methods
    //      array isn't aliased in any of our return values for our class methods
    //      gridSize is readonly and immutable

    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of grid, must be nonnegative integer
     */

    public constructor(
        public readonly gridSize: number
    ) {
        this.checkRep();
    }


    /**
     * helper function to convert an (x,y) coordinate to its corresponding grid cell location
     * a grid cell location is identified by the coordinate of it's bottom left corner
     * grid cell locations increment by 1 first from left to right, then from bottom to top
     * 
     * @param x  x coordinate of a grid cell's corner. 0 <= x < gridSize;
     * @param y  y coordinate of a grid cell's corner. 0 <= y < gridSize;
     * 
     * @returns a cell's location, which is just an index of the array
     */
    private convertToCell(x: number, y: number): number {
        return x + y * this.gridSize;
    }


    /**
     * helper function to convert a cell's locaation (index of the array) to its corresponding (x,y) coordinate
     * detalis on how it corresponds can be found in convertToCell()
     * 
     * @param cellLocation  cell's location, which is just an index of the array. 0 <= cellLocation < gridSize ** 2
     * @returns an [x,y] coordinate position of the cell location
     */
    private convertToCoord(cellLocation: number): [number, number] {
        return [cellLocation % this.gridSize, Math.floor(cellLocation / this.gridSize)];
    }


    /**
     * helper function to get the neighbors of a coordinate
     * 
     * @param cellLocation  the location of the cell (index of array)
     * 
     * @returns an array of neighbors in cell's location form (index of array)
     */
    private getNeighbors(cellLocation: number): Array<number> {
        const [x, y] = this.convertToCoord(cellLocation);

        const out: Array<number> = [];

        if (!(x - 1 < 0)) {
            out.push(this.convertToCell(x - 1, y));
        }

        if (!(x + 1 >= this.gridSize)) {
            out.push(this.convertToCell(x + 1, y));
        }

        if (!(y - 1 < 0)) {
            out.push(this.convertToCell(x, y - 1));
        }

        if (!(y + 1 >= this.gridSize)) {
            out.push(this.convertToCell(x, y + 1));
        }

        return out;
    }


    /**
     * Checks that the rep invariant is true
     */
    private checkRep(): void {
        assert(this.gridSize >= 0);
        assert(this.array.length <= (this.gridSize * this.gridSize));

        // rep invariant of one label per cell should through checked with static typing

        // check the rep invariant of 'a label's area on the grid must be contigious'
        const seen: Map<L, Set<number>> = new Map();

        for (let i = 0; i < this.array.length; i++) {
            const label = this.array[i];
            if (label !== undefined) {
                const set: Set<number> = seen.get(label) ?? new Set();
                set.add(i);
                seen.set(label, set);
            }
        }
        for (const label of seen.keys()) {
            const set: Set<number> = seen.get(label) ?? new Set();

            // can't check for neighbors if only one cell exists (also trivially true that it's contiguous)
            if (set.size === 1) {
                continue;
            }

            for (const cellLocation of set) {
                const neighbors = this.getNeighbors(cellLocation);

                let flag = false;
                for (const neighbor of neighbors) {
                    if (this.array[neighbor] === label) {
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    assert.fail("expected regions to be contigious");
                }
            }
        }
    }


    /**
     * helper function to see if a rect is connected to the rest of the label's area
     * 
     * @param label  the label whose region we want to look at
     * @param rect   the rect that we are trying to add
     * 
     * @returns a boolean for whether or not the rectangle is connected to the label
     */
    private isConnected(label: L, rect: Rect): boolean {
        for (let x = rect.x1; x < rect.x2; x++) {
            for (let y = rect.y1; y < rect.y2; y++) {
                const cellLocation = this.convertToCell(x, y);
                const neighbors = this.getNeighbors(cellLocation);
                for (const neighbor of neighbors) {
                    if (this.array[neighbor] === label) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    /**
     * @inheritDoc
     */
    public add(label: L, rect: Rect): void {
        if (!this.isConnected(label, rect) && this.array.includes(label)) {
            throw new Error("you're trying to add a rect that would cause the label to be uncontiguous");
        }

        for (let x = rect.x1; x < rect.x2; x++) {
            for (let y = rect.y1; y < rect.y2; y++) {
                const cellLocation = this.convertToCell(x, y);
                const cell = this.array[cellLocation];
                if (cell === undefined || cell === label) {
                    this.array[cellLocation] = label;
                }
                else {
                    throw new Error("you're trying to add a rect to a place that already contains another label region");
                }
            }
        }

        this.checkRep();
    }


    /**
     * @inheritDoc
     */
    public owners(rect: Rect): Set<L> {
        const rectOwners: Set<L> = new Set();

        for (let x = rect.x1; x < rect.x2; x++) {
            for (let y = rect.y1; y < rect.y2; y++) {
                const cellLocation = this.convertToCell(x, y);
                const cell = this.array[cellLocation];
                if (cell !== undefined) {
                    rectOwners.add(cell);
                }
            }
        }

        this.checkRep();
        return rectOwners;
    }


    /**
     * @inheritDoc
     */
    public bounds(label: L): Rect | undefined {

        let minX1: number = this.gridSize;
        let minY1: number = this.gridSize;
        let maxX2 = 0;
        let maxY2 = 0;

        let seen = false;

        for (let i = 0; i < this.array.length; i++) {
            if (this.array[i] === label) {
                seen = true;
                const [x, y] = this.convertToCoord(i);

                if (x < minX1) {
                    minX1 = x;
                }
                if (y < minY1) {
                    minY1 = y;
                }
                if (x >= maxX2) {
                    maxX2 = x + 1;
                }
                if (y >= maxY2) {
                    maxY2 = y + 1;
                }
            }
        }

        if (!seen) {
            return undefined;
        }

        this.checkRep();
        return new Rect(minX1, minY1, maxX2, maxY2);
    }

    /**
     * @inheritDoc
     */
    public toString(): string {
        const firstLine = `Region (gridSize = ${this.gridSize}):\n`;
        let body = ``;
        for (let i = 0; i < this.array.length; i++) {
            const [x, y] = this.convertToCoord(i);
            const line = `(${x},${y}): ${this.array[i]}\n`;
            body += line;
        }
        return firstLine + body;
    }

}


/**
 * @returns RegionSet implementations to test, not intended for clients
 * 
 * PS2 instructions: do not modify this function.
 * The `string` that appears in this signature does *not* become a generic parameter.
 */
export function implementations(): (new (_: number) => RegionSet<string>)[] {
    return [RepMapRegionSet, RepArrayRegionSet];
}
