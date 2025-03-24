"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTolerance = void 0;
exports.assertApproxEqual = assertApproxEqual;
/** Utility functions. @module */
const node_assert_1 = __importDefault(require("node:assert"));
/*
 * PS2 instructions: use this file to define public utility functions.
 *
 * You may define small private helper functions in individual implementation files.
 * For helper functions of any complexity and/or helpers used by both implementations and tests,
 * define them here and test them in `test/utils.test.ts`.
 */
/** Default tolerance for assertApproxEqual. */
exports.defaultTolerance = 0.001;
/**
 * @param actual actual value
 * @param expected expected value
 * @param message optional error message
 * @param tolerance optional error tolerance, overriding the default
 * @throws AssertionError iff |actual-expected| > tolerance
 */
function assertApproxEqual(actual, expected, message, tolerance = exports.defaultTolerance) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new node_assert_1.default.AssertionError({
            message,
            actual: `${actual}`,
            expected: `${expected} ± ${tolerance}`,
            operator: 'not approx. eq.',
            stackStartFn: node_assert_1.default.AssertionError,
        });
    }
}
//# sourceMappingURL=utils.js.map