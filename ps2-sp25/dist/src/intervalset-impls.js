"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepArrayIntervalSet = exports.RepMapIntervalSet = void 0;
exports.implementationsForTesting = implementationsForTesting;
/** Interval set implementations. @module */
const node_assert_1 = __importDefault(require("node:assert"));
const interval_js_1 = require("./interval.js");
const intervalset_js_1 = require("./intervalset.js");
/**
 * An implementation of IntervalSet.
 *
 * PS2 instructions: you must use the provided rep. You may not change the spec of the constructor.
 */
class RepMapIntervalSet {
    startMap = new Map();
    endMap = new Map();
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
    constructor() {
        this.checkRep();
    }
    /**
     * TODO
     */
    checkRep() {
        // TODO
    }
    /**
     * @inheritDoc
     */
    add(start, end, label) {
        if (this.startMap.has(label)) {
            const currentStart = this.startMap.get(label) ?? node_assert_1.default.fail("startMap doesn't have label when it should");
            if (currentStart !== start) {
                throw new intervalset_js_1.IntervalConflictError("conflicting label: passed in start value does not match current start value");
            }
            const currentEnd = this.endMap.get(currentStart) ?? node_assert_1.default.fail("endMap doesn't have the interval when it should");
            if (currentEnd !== end) {
                throw new intervalset_js_1.IntervalConflictError("conflicting label: passed in end value does not match current end value");
            }
            return;
        }
        else {
            for (const [currentStart, currentEnd] of this.endMap.entries()) {
                // check overlap
                if (start < currentEnd && end > currentStart) {
                    throw new intervalset_js_1.IntervalConflictError("conflicting inveral passed in");
                }
            }
            this.startMap.set(label, start);
            this.endMap.set(start, end);
        }
    }
    /**
     * @inheritDoc
     */
    labels() {
        const allLabels = this.startMap.keys();
        return new Set(allLabels);
    }
    /**
     * @inheritDoc
     */
    interval(label) {
        if (this.startMap.has(label)) {
            const currentStart = this.startMap.get(label) ?? node_assert_1.default.fail("startMap doesn't have label when it should");
            const currentEnd = this.endMap.get(currentStart) ?? node_assert_1.default.fail("endMap doesn't have the interval when it should");
            return new interval_js_1.Interval(currentStart, currentEnd);
        }
        return undefined;
    }
    toString() {
        // TODO
        return "";
    }
}
exports.RepMapIntervalSet = RepMapIntervalSet;
/**
 * An implementation of IntervalSet.
 *
 * PS2 instructions: you must use the provided rep. You may not change the spec of the constructor.
 */
class RepArrayIntervalSet {
    labelList = []; // "labelList[i] = Label" means "Label has start at index i"
    valueList = []; // "valueList[i]" means that whichever label is at that index has this at its end
    // Abstraction function:
    //   TODO
    // Representation invariant:
    //   TODO
    // Safety from rep exposure:
    //   TODO
    /**
     * Create an empty interval set.
     */
    constructor() {
        this.checkRep();
    }
    /**
     * TODO
     */
    checkRep() {
        // TODO
    }
    /**
     * @inheritDoc
     */
    add(start, end, label) {
        // check for if label already exists
        for (let i = 0; i < this.labelList.length; i++) {
            if (this.labelList[i] === label) {
                const currentStart = BigInt(i);
                const currentEnd = this.valueList[i] ?? node_assert_1.default.fail("existing (same) label has no end interval when it should");
                if (start === currentStart && end === currentEnd) {
                    return;
                }
                throw new intervalset_js_1.IntervalConflictError("conflicting label: same label should have same interval bounds");
            }
        }
        // label doesn't exist
        for (let i = 0; i < this.labelList.length; i++) {
            if (this.labelList[i] !== undefined) {
                const currentStart = BigInt(i);
                const currentEnd = this.valueList[i] ?? node_assert_1.default.fail("existing (different) label has no end interval when it should");
                // check overlap
                if (start < currentEnd && end > currentStart) {
                    throw new intervalset_js_1.IntervalConflictError("conflicting interval passed in");
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
    labels() {
        const out = new Set();
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
    interval(label) {
        for (let i = 0; i < this.labelList.length; i++) {
            const currentLabel = this.labelList[i];
            if (label === currentLabel) {
                const start = BigInt(i);
                const end = this.valueList[i] ?? node_assert_1.default.fail("end interval for already existing label doesn't exist when it should");
                return new interval_js_1.Interval(start, end);
            }
        }
        return undefined;
    }
    toString() {
        // TODO
        return "";
    }
}
exports.RepArrayIntervalSet = RepArrayIntervalSet;
/**
 * PS2 instructions: both implementations are exported for testing purposes only.
 * @returns IntervalSet implementations to test
 */
function implementationsForTesting() {
    return [RepMapIntervalSet, RepArrayIntervalSet];
}
//# sourceMappingURL=intervalset-impls.js.map