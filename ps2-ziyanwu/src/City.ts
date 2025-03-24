/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RegionSet, makeRegionSet } from './RegionSet';
import * as utils from './utils';

/**
 * A mutable set of labeled "buildings" in 3D, where a building is a contiguous set of cubic cells
 * in a 3D grid with origin at (0,0,0) and extending to (`gridSize`,`gridSize`,`gridSize`)
 * (for some nonnegative integer `gridSize`, fixed when the set is created).
 * Coordinates (x,y,z) are interpreted as points in 3D space in the conventional way.
 * 
 * Buildings must rest on the ground (the z=0 plane), and a building must be *contiguous*:
 * any cell in the building must be reachable from any other cell in the building by a path
 * passing through adjacent cells, where we define adjacent cells as sharing a face (not just an edge or corner).
 * 
 * Buildings have floors numbered from 0 (the ground floor, resting on the ground plane) upwards to at
 * most `gridSize`-1. Each individual floor of a building must be contiguous.
 * 
 * Each building is labeled uniquely, and buildings must *not intersect*: no cell may be in more than one building.
 * 
 * Labels are of arbitrary type `L` and are compared for equality using ===. They may not be null or undefined.
 * 
 * PS2 instructions: this is a required ADT interface.
 * You may not change the specifications or add new methods.
 * 
 * @param L type of labels in this city, compared for equality using ===.
 */
export class City<L> {

    private readonly array: Array<RegionSet<L>> = [];

    // Abstraction function:
    //      AF(array, gridSize) = a 3d grid with 'gridSize * gridSize * gridSize' dimensions. The grid contains buildings that each take up a unique volume of the grid.
    // Representation invariant:
    //      gridSize >= 0
    //      array.length <= gridSize
    //      all buildings must be connected to the ground
    //      all buildings must be contiguous (both between and within floors)
    //      no cell in the grid can belong to more than one building label 
    // Safety from rep exposure:
    //      array is private, only accessible through class methods
    //      arary is readonly      
    //      gridSize is readonly and immutable

    /**
     * Create an empty city with a `gridSize` x `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of city grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        for (let i = 0; i < gridSize; i++) {
            this.array.push(makeRegionSet(gridSize));
        }
        this.checkRep();
    }

    /**
     * helper function to determine if all the labels in the 3d space are grounded
     * 
     * @param groundedLabels  the set of all labels that are on the ground floor
     * @returns  whether or not all labels in the 3d space are grounded
     */
    private checkAllLabelsGrounded(groundedLabels: Set<L>): boolean {

        for (let i = 1; i < this.array.length; i++) {
            const layer = this.array[i];
            if (layer !== undefined) {
                for (const label of layer.owners(new Rect(0, 0, this.gridSize, this.gridSize))) {
                    if (!groundedLabels.has(label)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * helper function to convert coordinate in 2d space to a unique grid cell number
     * 
     * @param x  the x coordinate
     * @param y  the y coordinate
     * 
     * @returns number  a number that unique corresponds to a specific grid cell
     */
    private convertToCell(x: number, y: number): number {
        return x + y * this.gridSize;
    }


    /**
     * helper function to check whether or not a label is in a grid cell
     * 
     * @param label  the label we want to check
     * @param floor  the z-level of the cell we want to check
     * @param x  the x coordinate of the cell we want to check
     * @param y  the y coordinate of the cell we want to check
     * @returns  whether or not the label is in that cell
     */
    private isLabelInCell(label: L, floor: number, x: number, y: number): boolean {
        const region = this.array[floor];
        if (region !== undefined) {
            // label should be a Set with only one element
            const cell: Set<L> = region.owners(new Rect(x, y, x + 1, y + 1));
            if (cell.has(label)) {
                return true;
            }
        }
        return false;
    }


    /**
     * helper function to determine if all the labels are contiguous across different floors
     * 
     * @param label  the label we want to check
     * 
     * @returns whether or not the label's regions are contiguous vertically
     */
    private checkContiguousBetweenFloors(label: L): boolean {

        const seen: Array<Set<number>> = [];

        for (let floor = 0; floor < this.array.length; floor++) {
            seen[floor] = new Set();

            const region = this.array[floor];
            if (region === undefined) {
                continue;
            }

            const bounds = region.bounds(label);
            if (bounds === undefined) {
                continue;
            }

            for (let x = bounds.x1; x < bounds.x2; x++) {
                for (let y = bounds.y1; y < bounds.y2; y++) {
                    if (this.isLabelInCell(label, floor, x, y)) {
                        const set = seen[floor] ?? new Set();
                        set.add(this.convertToCell(x, y));
                    }
                }
            }
        }

        for (let i = 0; i < seen.length - 1; i++) {
            const bottomLayer = seen[i] ?? new Set();
            const topLayer = seen[i + 1] ?? new Set();
            let flag = false;

            for (const cell of topLayer) {
                if (bottomLayer.has(cell)) {
                    flag = true;
                    break;
                }
            }
            if (!flag && topLayer.size > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks that the rep invariant is true;
     */
    private checkRep(): void {
        assert(this.gridSize >= 0);
        assert(this.array.length <= this.gridSize);


        const ground = this.array[0];
        if (ground !== undefined) {

            const groundedLabels: Set<L> = ground.owners(new Rect(0, 0, this.gridSize, this.gridSize));
            assert(this.checkAllLabelsGrounded(groundedLabels), "expected all labels to be grounded");

            for (const label of groundedLabels) {
                assert(this.checkContiguousBetweenFloors(label));
            }
        }

        // rep invariant of buildings being contiguous within the same floor is perserved by RegionSet's spec

        // rep invariant of no cell in the grid can belong to more than one label is perserved by RegionSet's spec
    }


    /**
     * Add a rectangle of grid cells to a particular floor of the building labeled by the given label (creating
     * a building or adding a floor if necessary), if the expanded building rests on the ground plane, is still
     * contiguous, and the expansion does not intersect with other existing buildings.
     * 
     * @param label label of building
     * @param floor floor of building to expand. Must be an integer in [0,`gridSize`-1].
     * @param rect rectangle to add to specified floor of the labeled building.  Required to have nonzero area
     *             and integer coordinates drawn from [0,`gridSize`].
     * @throws Error if adding the expansion would make the building ungrounded, the building or floor
     *         discontiguous, or cause an intersection with a cell in another building.
     */
    public expand(label: L, floor: number, rect: Rect): void {

        const region = this.array[floor];
        if (region !== undefined) {
            region.add(label, rect);

            const ground = this.array[0];
            if (ground === undefined) {
                throw new Error("no buildings are on the ground, yet you tried to add a building");
            }
            const groundedLabels: Set<L> = ground.owners(new Rect(0, 0, this.gridSize, this.gridSize));
            if (!this.checkAllLabelsGrounded(groundedLabels)) {
                throw new Error("you tried to expand on building and made it ungrounded");
            }

            if (!this.checkContiguousBetweenFloors(label)) {
                throw new Error("you tried to expand on a region that would cause the building to not be contiguous between floors");
            }
        }

        this.checkRep();
    }

    /**
     * Get the labels of buildings whose projections onto the ground plane intersect the given rectangle
     * (where the intersection must contain at least one full grid cell).
     * 
     * @param rect rectangle to query. Its coordinates must be integers in [0,`gridSize`].
     * @returns the labels of buildings in this city whose projections onto the ground plane intersect with rect
     *          in at least one grid cell
     */
    public owners(rect: Rect): Set<L> {
        const out: Set<L> = new Set();

        for (let floor = 0; floor < this.gridSize; floor++) {
            const region = this.array[floor];
            if (region === undefined) {
                continue;
            }
            const labels = region.owners(rect);
            for (const label of labels) {
                out.add(label);
            }
        }

        return out;
    }

    /**
     * Get the footprint and height of a labeled building.
     * 
     * @param label label of building
     * @returns building's footprint (smallest rectangle that contains the projection of the building onto the
     *          ground plane) and height (number of floors in the building), or undefined if no building with
     *          that label exists in this city.
     */
    public bounds(label: L): { footprint: Rect, height: number; } | undefined {
        let height = 0;
        let minX1: number = this.gridSize;
        let minY1: number = this.gridSize;
        let maxX2 = 0;
        let maxY2 = 0;

        let seen = false;

        for (let floor = 0; floor < this.gridSize; floor++) {
            const region = this.array[floor];
            if (region === undefined) {
                continue;
            }
            const bounds = region.bounds(label);
            if (bounds === undefined) {
                continue;
            }
            seen = true;
            height = floor + 1;
            if (bounds.x1 < minX1) {
                minX1 = bounds.x1;
            }
            if (bounds.y1 < minY1) {
                minY1 = bounds.y1;
            }
            if (bounds.x2 > maxX2) {
                maxX2 = bounds.x2;
            }
            if (bounds.y2 > maxY2) {
                maxY2 = bounds.y2;
            }
        }

        if (!seen) {
            return undefined;
        }
        else {
            return { footprint: new Rect(minX1, minY1, maxX2, maxY2), height: height };
        }
    }

    public toString(): string {
        const firstLine = `3D World (gridSize = ${this.gridSize}):\n\n`;
        let body = ``;
        for (let floor = 0; floor < this.array.length; floor++) {
            const region = this.array[floor];
            if (region !== undefined) {
                body += `Floor ${floor}:\n`;
                body += region.toString();
                body += '------------------------------------\n\n';
            }
        }
        return firstLine + body;
    }


}
