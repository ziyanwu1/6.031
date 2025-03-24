"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
/**
 * Represents an immutable half-open interval.
 *
 * PS2 instructions: do NOT change this class.
 */
class Interval {
    start;
    end;
    /**
     * Make an interval [start, end).
     *
     * @param start low end of the interval, inclusive
     * @param end high end of the interval, exclusive, must be greater than start
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.checkRep();
    }
    // AF(start, end) = half-open interval [start, end)
    // RI: start < end
    // Safety from rep exposure: all fields are unreassignable and have immutable built-in type
    // assert the rep invariant
    checkRep() {
        (0, node_assert_1.default)(this.start < this.end, `expected start=${this.start} < end=${this.end}`);
    }
    /**
     * @inheritDoc
     */
    toString() {
        this.checkRep();
        return `Interval[${this.start},${this.end})`;
    }
}
exports.Interval = Interval;
//# sourceMappingURL=interval.js.map