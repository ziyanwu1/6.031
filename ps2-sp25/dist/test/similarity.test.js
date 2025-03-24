"use strict";
/* Copyright (c) 2025 MIT 6.102 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const multiintervalset_js_1 = require("../src/multiintervalset.js");
const similarity_js_1 = require("../src/similarity.js");
/*
 * Tests for the similarity module.
 */
describe('similarity', function () {
    it('covers empty', function () {
        const result = (0, similarity_js_1.similarity)([], new multiintervalset_js_1.MultiIntervalSet(), new multiintervalset_js_1.MultiIntervalSet());
        node_assert_1.default.strictEqual(0, result);
    });
    it("given example", function () {
        // A: { "happy" = [[0, 1), [2,4)], "sad" = [[1,2)] } 
        // B: { "sad" = [[1, 2)], "meh" = [[2,3)], "happy" = [[3,4)] }
        // similarities: [ ["happy","meh",0.5], ["meh","sad",0.5] ]
        // 
        // = 0.625
        const setA = new multiintervalset_js_1.MultiIntervalSet();
        setA.add(0n, 1n, "happy");
        setA.add(1n, 2n, "sad");
        setA.add(2n, 4n, "happy");
        const setB = new multiintervalset_js_1.MultiIntervalSet();
        setB.add(1n, 2n, "sad");
        setB.add(2n, 3n, "meh");
        setB.add(3n, 4n, "happy");
        const similarities = [["happy", "meh", 0.5], ["meh", "sad", 0.5]];
        node_assert_1.default.strictEqual((0, similarity_js_1.similarity)(similarities, setA, setB), 0.625);
    });
});
describe('TODO', function () {
    /*
     * Testing strategy for TODO ADT
     *
     * TODO
     */
    it('covers...', function () {
        // TODO remember to write the partitions covered in the test name
        // new DualInterval(); // TODO
    });
});
//# sourceMappingURL=similarity.test.js.map