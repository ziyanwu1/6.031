/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'node:assert';
import { Interval } from './interval.js';
import { IntervalSet, IntervalConflictError, makeIntervalSet } from './intervalset.js';
import * as utils from './utils.js';

/**
 * A mutable set of labeled intervals, where each label is associated with one or more non-overlapping
 * half-open intervals [start, end). Neither intervals with the same label nor with different labels
 * may overlap.
 * 
 * For example, { "A"=[[0,10)], "B"=[[20,30)] } is a multi-interval set where the labels are strings
 * "A" and "B". We could add "A"=[10,20) to that set to obtain { "A"=[[0,10),[10,20)], "B"=[[20,30)] }.
 * 
 * Labels are of arbitrary type `Label` and are compared for equality using ===. They may not be null
 * or undefined.
 * 
 * PS2 instructions: this is a required ADT.
 * You may not change the specifications or add new methods.
 * 
 * @typeParam Label type of labels in this set, compared for equality using ===
 */
export class MultiIntervalSet<Label> {

    private readonly map: Map<Label, IntervalSet<number>> = new Map();

    // Abstraction function:
    //   TODO
    // Representation invariant:
    //   TODO
    // Safety from rep exposure:
    //   TODO

    /**
     * TODO
     * @param label 
     */
    private getNextMiniLabel(label: Label): number {
        if (this.map.has(label)) {
            const intervalSet = this.map.get(label) ?? assert.fail("interval set does not exist when it should");
            const nextMiniLabel = intervalSet.labels().size;
            return nextMiniLabel;
        }

        return 0;
    }

    /**
     * Create a new multi-interval set containing the given labeled intervals; or empty if none
     * (inital should be guaranteed not to overlap)
     * 
     * @param initial optional initial contents of the new multi-interval set
     */
    public constructor(initial?: IntervalSet<Label>) {
        if (initial === undefined) {
            return;
        }

        const labels = initial.labels();
        for (const label of labels) {
            const interval = initial.interval(label);
            if (interval === undefined) {
                continue;
            }

            this.add(interval.start, interval.end, label);
        }
    }

    private checkRep(): void {
        // TODO
    }

    /**
     * Add a labeled interval to this set, if it is not already present and it does not conflict with
     * existing intervals.
     * 
     * Labeled intervals *conflict* if:
     * - they have the same label with different, overlapping intervals; or
     * - they have different labels with overlapping intervals.
     * 
     * For example, if this set is { "A"=[[0,10),[20,30)] },
     * - add("A"=[0,10)) has no effect
     * - add("B"=[10,20)) adds "B"=[[10,20)]
     * - add("C"=[20,30)) throws IntervalConflictError
     * 
     * @param start low end of the interval, inclusive
     * @param end high end of the interval, exclusive, must be greater than start
     * @param label label to add
     * @throws an {@link IntervalConflictError} if label is already in this set and is associated with
     *   an interval other than [start,end) that overlaps [start,end), or if an interval in this set
     *   with a different label overlaps [start,end)
     */
    public add(start: bigint, end: bigint, label: Label): void {
        // check for exact equal interval in the same letter
        const sameIntervalSet = this.map.get(label);
        if (sameIntervalSet !== undefined) {
            for (const label of sameIntervalSet.labels()) {
                const sameInterval = sameIntervalSet.interval(label) ?? assert.fail("an interval isn't returning when we know a label definitely exists");
                if (sameInterval.start === start && sameInterval.end === end) {
                    return;
                }
            }
        }

        // check for ALL overlaps
        for (const [_, intervalSet] of this.map.entries()) {
            for (const label of intervalSet.labels()) {
                const interval = intervalSet.interval(label) ?? assert.fail("intervalSet can't get the interval despite the label existing");
                const currentStart = interval.start;
                const currentEnd = interval.end;
                if (start < currentEnd && end > currentStart) {
                    throw new IntervalConflictError("intervals conflict in MultiIntervalSet");
                }
            }
        }

        // no overlaps, so add
        if (!this.map.has(label)) {
            this.map.set(label, makeIntervalSet());
        }

        const nextMiniLabel = this.getNextMiniLabel(label);
        const addIntervalSet = this.map.get(label) ?? assert.fail("map doesn't have intervalSet for label when it should");
        addIntervalSet.add(start, end, nextMiniLabel);
    }

    /**
     * Remove all intervals from this set.
     * 
     * @returns true if this set was non-empty, and false otherwise
     */
    public clear(): boolean {
        const out = (this.map.size !== 0);
        this.map.clear();
        return out;
    }

    /**
     * Get the labels in this set.
     * 
     * @returns the labels in this set
     */
    public labels(): Set<Label> {
        const allLabels = this.map.keys();
        return new Set(allLabels);
    }

    /**
     * Get all the intervals in this set associated with a given label, if any. The returned set has
     * integer labels that act as indices: label 0 is associated with the lowest interval, 1 the next,
     * and so on, for all the intervals in this set that have the provided label.
     * 
     * For example, if this set is { "A"=[[0,10),[20,30)], "B"=[[10,20)] },
     * - intervals("A") returns { 0=[0,10), 1=[20,30) }
     * 
     * @param label the label
     * @returns a new interval set that associates integer indices with the in-order intervals of
     *          label in this set
     */
    public intervals(label: Label): IntervalSet<number> {
        const out = makeIntervalSet<number>();
        
        const intervalSet = this.map.get(label);
        if (intervalSet !== undefined) {
            const intervals: Interval[] = [];
            for (const label of intervalSet.labels()) {
                const interval = intervalSet.interval(label) ?? assert.fail("no interval returned when label should exist in the intervalSet");
                intervals.push(interval);
            }

            // order by 'start' number
            intervals.sort((a, b) => {
                return Number(a.start - b.start);
            });

            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i] ?? assert.fail("an interval should exist here, but was undefined instead");             
                out.add(interval.start, interval.end, i);
            }
        }

        return out;
    }

    public toString(): string {
        // TODO
        return "";
    }

}
