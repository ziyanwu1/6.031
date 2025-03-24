"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualInterval = void 0;
exports.similarity = similarity;
const node_assert_1 = __importDefault(require("node:assert"));
/**
 * Measure similarity between multi-interval sets with string labels.
 *
 * Uses a client-provided definition of label similarities, where 0 is least- and 1 is most-similar.
 *
 * The similarity between two multi-interval sets, where at least one is nonempty, is the ratio:
 *     (sum of piecewise-matching between the sets) / (span of the sets)
 * where the span is the length of the smallest interval that contains all the intervals from both
 * sets, and the amount of piecewise-matching for any unit interval [i, i+1) is:
 * -    0 if neither set has a label on that interval
 * -    0 if only one set has a label on that interval
 * -    otherwise, the similarity between labels as defined by the client, explained below
 *
 * Two empty sets have similarity 0.
 *
 * For example, suppose you have multi-interval sets that use labels "happy", "sad", and "meh"; and
 * similarity between labels is defined as:
 * -    1 if both are "happy", both "sad", or both "meh"
 * -    0.5 if one is meh and the other is "happy" or "sad"
 * -    0 otherwise
 * Then the similarity between these two sets:
 *     { "happy" = [[0, 1), [2,4)], "sad" = [[1,2)] }
 *     { "sad" = [[1, 2)], "meh" = [[2,3)], "happy" = [[3,4)] }
 * ... would be: (0 + 1 + 0.5 + 1) / (4 - 0) = 0.625
 *
 * Label similarities are provided as an array of tuples, where the first two elements give a pair of
 * labels, and the third element gives the similarity between them, between 0 and 1 inclusive.
 * Similarity between labels is symmetric, so the order of labels in each tuple is irrelevant, and a
 * pair of labels may not appear more than once. The similarity between all other pairs of labels is:
 * -    1 iff they are the same string, and
 * -    0 otherwise
 *
 * For example, the following gives the similarity values used above:
 *     [ ["happy","meh",0.5], ["meh","sad",0.5] ]
 *
 * When the individual piecewise-matching terms, the sum of piecewise-matching between the sets, and
 * the span of the sets can be represented as number values with high precision, the returned value
 * will have similar precision. Otherwise, it may be similarly imprecise.
 *
 * PS2 instructions: this is a required function.
 * You may strengthen its specification, but may NOT weaken it.
 *
 * @param similarities label similarity definition as described above
 * @param setA multi-interval set with string labels
 * @param setB multi-interval set with string labels
 * @returns similarity between setA and setB as defined above
 */
function similarity(similarities, setA, setB) {
    // EXAMPLE:
    // A = { "happy" = [[0, 1), [2,4)], "sad" = [[1,2)] } 
    // B = { "sad" = [[1, 2)], "meh" = [[2,3)], "happy" = [[3,4)] }
    // similarities: [ ["happy","meh",0.5], ["meh","sad",0.5] ]
    if (setA.labels().size === 0 && setB.labels().size === 0) {
        return 0;
    }
    let total = 0;
    // both same labels
    const allLabels = new Set([...setA.labels(), ...setB.labels()]);
    for (const label of allLabels) {
        const multiIntervalA = setA.intervals(label);
        const multiIntervalB = setB.intervals(label);
        const dualInterval = new DualInterval(multiIntervalA, multiIntervalB);
        total += dualInterval.similarity(1);
    }
    // go through similarities list
    for (const [label1, label2, weight] of similarities) {
        // first combo
        const firstMultiIntervalA = setA.intervals(label1);
        const firstMultiIntervalB = setB.intervals(label2);
        const firstDualInterval = new DualInterval(firstMultiIntervalA, firstMultiIntervalB);
        total += firstDualInterval.similarity(weight);
        // second combo
        const secondMultiIntervalA = setA.intervals(label2);
        const secondMultiIntervalB = setB.intervals(label1);
        const secondDualInterval = new DualInterval(secondMultiIntervalA, secondMultiIntervalB);
        total += secondDualInterval.similarity(weight);
    }
    // find span
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    // span of setA
    for (const label of setA.labels()) {
        const intervalSet = setA.intervals(label);
        const low = intervalSet.interval(0);
        if (low !== undefined) {
            min = Math.min(min, Number(low.start));
        }
        const labels = intervalSet.labels();
        if (labels.size > 0) {
            const high = intervalSet.interval(Math.max(...labels));
            if (high !== undefined) {
                max = Math.max(max, Number(high.end));
            }
        }
    }
    // span of setB
    for (const label of setB.labels()) {
        const intervalSet = setB.intervals(label);
        const low = intervalSet.interval(0);
        if (low !== undefined) {
            min = Math.min(min, Number(low.start));
        }
        const labels = intervalSet.labels();
        if (labels.size > 0) {
            const high = intervalSet.interval(Math.max(...labels));
            if (high !== undefined) {
                max = Math.max(max, Number(high.end));
            }
        }
    }
    const span = max - min;
    return total / span;
}
/**
 * TODO
 * (this does not mutate the given IntervalSets)
 */
class DualInterval {
    firstIntervalSet;
    secondIntervalSet;
    constructor(firstIntervalSet, secondIntervalSet) {
        this.firstIntervalSet = firstIntervalSet;
        this.secondIntervalSet = secondIntervalSet;
        this.checkRep();
    }
    checkRep() {
    }
    /**
     * Calculates the length in which the two intervals overlap.
     * Returns 0 if no overlap.
     * @param interval1
     * @param interval2
     */
    overlap(interval1, interval2) {
        // if there's an overlap, taking the smallest end and the biggest start and subtracting gets you the overlap
        // if there isn't a overlap, the result would be a negative number but since we do max(0, _), it will just return 0
        return Math.max(0, Math.min(Number(interval1.end), Number(interval2.end)) - Math.max(Number(interval1.start), Number(interval2.start)));
    }
    similarity(weight) {
        let totalOverlap = 0;
        const allFirstIntervals = [];
        const allSecondIntervals = [];
        // get all first intervals (for loop + .push())
        for (const firstLabel of this.firstIntervalSet.labels()) {
            const interval = this.firstIntervalSet.interval(firstLabel) ?? node_assert_1.default.fail("no interval found for a label that should be there");
            allFirstIntervals.push(interval);
        }
        // get all second intervals (for loop + .push())
        for (const secondLabel of this.secondIntervalSet.labels()) {
            const interval = this.secondIntervalSet.interval(secondLabel) ?? node_assert_1.default.fail("no interval found for a label that should be there");
            allSecondIntervals.push(interval);
        }
        // O(n^2) go through each pair and run overlap() on them
        for (const firstInterval of allFirstIntervals) {
            for (const secondInterval of allSecondIntervals) {
                totalOverlap += this.overlap(firstInterval, secondInterval);
            }
        }
        return weight * totalOverlap;
    }
}
exports.DualInterval = DualInterval;
//# sourceMappingURL=similarity.js.map