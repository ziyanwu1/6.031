"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalConflictError = void 0;
exports.makeIntervalSet = makeIntervalSet;
const intervalset_impls_js_1 = require("./intervalset-impls.js");
/**
 * Create an empty interval set.
 *
 * @typeParam Label type of labels in the set
 * @returns a new empty interval set
 */
function makeIntervalSet() {
    return new intervalset_impls_js_1.RepMapIntervalSet();
}
/**
 * Thrown to indicate an interval set conflict.
 *
 * PS2 instructions: do not change this class.
 */
class IntervalConflictError extends Error {
}
exports.IntervalConflictError = IntervalConflictError;
//# sourceMappingURL=intervalset.js.map