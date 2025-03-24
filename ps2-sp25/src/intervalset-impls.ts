/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/** Interval set implementations. @module */

import assert from 'node:assert';
import { Interval } from './interval.js';
import { IntervalSet, IntervalConflictError } from './intervalset.js';
import * as utils from './utils.js';

/**
 * An implementation of IntervalSet.
 *
 * PS2 instructions: you must use the provided rep. You may not change the spec of the constructor.
 */
export class RepMapIntervalSet<Label> implements IntervalSet<Label> {

    private readonly startMap: Map<Label, bigint> = new Map();
    private readonly endMap: Map<bigint, bigint> = new Map();

    // Abstraction function:
    //   AF(startMap, endMap) = an Interval set where:
    //       - the key in startMap represents the label and its value is the starting point for the label
    //       - the key in endMap represents the start to an interval and the value represents the end to an interval
    // Representation invariant:
    //   Every label: start in startMap has a corresponding start: end in endMap
    //   Every start: end in endMap follows: start < end
    // Safety from rep exposure:
    //   All fields are private;
    //   add() mutates the instance variables, but doesn't impact the client

    /**
     * Create an empty interval set.
     */
    public constructor() {
        this.checkRep();
    }

    /**
     * TODO
     */
    private checkRep(): void {
        // TODO
    }

    /**
     * @inheritDoc
     */
    public add(start: bigint, end: bigint, label: Label): void {
        if (this.startMap.has(label)) {
            const currentStart = this.startMap.get(label) ?? assert.fail("startMap doesn't have label when it should");

            if (currentStart !== start) {
                throw new IntervalConflictError("conflicting label: passed in start value does not match current start value");
            }

            const currentEnd = this.endMap.get(currentStart) ?? assert.fail("endMap doesn't have the interval when it should");
            if (currentEnd !== end) {
                throw new IntervalConflictError("conflicting label: passed in end value does not match current end value");
            }

            return;
        } else {
            for (const [currentStart, currentEnd] of this.endMap.entries()) {
                // check overlap
                if (start < currentEnd && end > currentStart) {
                    throw new IntervalConflictError("conflicting inveral passed in");
                }
            }

            this.startMap.set(label, start);
            this.endMap.set(start, end);
        }
    }

    /**
     * @inheritDoc
     */
    public labels(): Set<Label> {
        const allLabels = this.startMap.keys();
        return new Set(allLabels);
    }

    /**
     * @inheritDoc
     */
    public interval(label: Label): Interval | undefined {
        if (this.startMap.has(label)) {
            const currentStart = this.startMap.get(label) ?? assert.fail("startMap doesn't have label when it should");
            const currentEnd = this.endMap.get(currentStart) ?? assert.fail("endMap doesn't have the interval when it should");
            return new Interval(currentStart, currentEnd);
        }

        return undefined;
    }

    public toString(): string {
        // TODO
        return "";
    }
}

/**
 * An implementation of IntervalSet.
 *
 * PS2 instructions: you must use the provided rep. You may not change the spec of the constructor.
 */
export class RepArrayIntervalSet<Label> implements IntervalSet<Label> {

    private readonly labelList: Array<Label> = []; // "labelList[i] = Label" means "Label has start at index i"
    private readonly valueList: Array<bigint> = []; // "valueList[i]" means that whichever label is at that index has this at its end

    // Abstraction function:
    //   TODO
    // Representation invariant:
    //   TODO
    // Safety from rep exposure:
    //   TODO

    /**
     * Create an empty interval set.
     */
    public constructor() {
        this.checkRep();
    }

    /**
     * TODO
     */
    private checkRep(): void {
        // TODO
    }

    /**
     * @inheritDoc
     */
    public add(start: bigint, end: bigint, label: Label): void {
        // check for if label already exists
        for (let i = 0; i < this.labelList.length; i++) {
            if (this.labelList[i] === label) {
                const currentStart = BigInt(i);
                const currentEnd = this.valueList[i] ?? assert.fail("existing (same) label has no end interval when it should");

                if (start === currentStart && end === currentEnd) {
                    return;
                }

                throw new IntervalConflictError("conflicting label: same label should have same interval bounds");
            }
        }

        // label doesn't exist
        for (let i = 0; i < this.labelList.length; i++) {
            if (this.labelList[i] !== undefined) {
                const currentStart = BigInt(i);
                const currentEnd = this.valueList[i] ?? assert.fail("existing (different) label has no end interval when it should");

                // check overlap
                if (start < currentEnd && end > currentStart) {
                    throw new IntervalConflictError("conflicting interval passed in");
                }
            }
        }

        const index = Number(start);
        this.labelList[index] = label;
        this.valueList[index] = end;
    }

    /**
     * @inheritDoc
     */
    public labels(): Set<Label> {
        const out = new Set<Label>();

        for (const label of this.labelList) {
            if (label !== undefined) {
                out.add(label);
            }
        }

        return out;
    }

    /**
     * @inheritDoc
     */
    public interval(label: Label): Interval | undefined {
        for (let i = 0; i < this.labelList.length; i++) {
            const currentLabel = this.labelList[i];
            if (label === currentLabel) {
                const start = BigInt(i);
                const end = this.valueList[i] ?? assert.fail("end interval for already existing label doesn't exist when it should");
                return new Interval(start, end);
            }
        }

        return undefined;
    }

    public toString(): string {
        // TODO
        return "";
    }
}

/**
 * PS2 instructions: both implementations are exported for testing purposes only.
 * @returns IntervalSet implementations to test
 */
export function implementationsForTesting(): Array<IntervalSetCtor> {
    return [ RepMapIntervalSet, RepArrayIntervalSet ];
}

// type IntervalSetCtor = new <L extends string>() => IntervalSet<string>; // TODO remove this line in Problem 2.3
type IntervalSetCtor = new <L>() => IntervalSet<L>; // TODO and use this line instead
