/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Flashcard, AnswerDifficulty } from './flashcards';

/**
 * Reorganize learning buckets from a map representation to a list-of-sets
 * representation.
 *
 * @param bucketMap maps each flashcard to a (nonnegative integer) bucket number
 * 
 * @returns a list of disjoint sets whose union is the set of cards in
 *          bucketMap, and where list[i] is the set of cards that
 *          bucketMap maps to i, for all i in [0, list.length).
 */
export function toBucketSets(bucketMap: Map<Flashcard, number>): Array<Set<Flashcard>> {
    const out: Array<Set<Flashcard>> = [];

    for (const [card, bucketNum] of bucketMap.entries()) {
        if (out[bucketNum] === undefined) {
            out[bucketNum] = new Set();
        }

        out[bucketNum].add(card);
    }

    for (let i = 0; i < out.length; i++) {
        if (out[i] === undefined) {
            out[i] = new Set();
        }
    }

    return out;
}

/**
 * Find a minimal range of bucket numbers covering a list of learning buckets.
 * 
 * @param buckets a list of disjoint sets representing learning buckets, where
 *                buckets[i] is the set of cards in the ith bucket,
 *                for all 0 <= i < buckets.length.
 * 
 * @returns a pair of integers [low, high], 0 <= low <= high, such that every
 *          card in buckets has an integer bucket number in the range [low...high]
 *          inclusive, and high - low is as small as possible
 */
export function getBucketRange(buckets: Array<Set<Flashcard>>): Array<number> {
    let low = -1;
    let high = -1;

    for (let i = 0; i < buckets.length; i++) {
        if (buckets[i].size > 0) {
            if (low === -1) {
                low = i;
            }

            high = i;
        }
    }

    // couldn't find any nonempty set
    if (low === -1) {
        low = 0;
    }
    if (high === -1) {
        high = 0;
    }

    return [low, high];
}

/**
 * Generate a sequence of flashcards for practice on a particular day.
 *
 * @param day day of the learning process. Must be integer >= 1.
 * 
 * @param buckets a list of disjoint sets representing learning buckets,
 *                where buckets[i] is the set of cards in the ith bucket
 *                for all 0 <= i <= retiredBucket
 * 
 * @param retiredBucket number of retired bucket. Must be an integer >= 0.
 * 
 * @returns a sequence of flashcards such that a card appears in the sequence if
 *          and only if its bucket number is some i < retiredBucket such that
 *          `day` is divisible by 2^i
 */
export function practice(day: number, buckets: Array<Set<Flashcard>>, retiredBucket: number): Array<Flashcard> {

    const out: Array<Flashcard> = [];

    for (let i = 0; i < retiredBucket; i++) {
        if ((day % (2 ** i)) === 0) {
            for (const card of buckets[i]) {
                out.push(card);
            }
        }
    }

    return out;
}

/**
 * Update step for the Modified-Leitner algorithm.
 * 
 * @param card a flashcard the user just saw
 * 
 * @param answer the difficulty of the user's answer to the flashcard
 * 
 * @param bucketMap represents learning buckets before the flashcard was seen.
 *                  Maps each flashcard in the map to a nonnegative integer 
 *                  bucket number in the range [0...retiredBucket] inclusive.
 *                  Mutated by this method to put `card` in the appropriate bucket,
 *                  as determined by the Modified-Leitner algorithm.
 * 
 * @param retiredBucket number of retired bucket. Must be an integer >= 0.
 */
export function update(card: Flashcard, answer: AnswerDifficulty, bucketMap: Map<Flashcard, number>, retiredBucket: number): void {

    // if card isn't found in bucket, assume it started at 0
    const cardValue = bucketMap.get(card) ?? 0;

    if (answer === AnswerDifficulty.EASY) {
        if (cardValue < retiredBucket) {
            bucketMap.set(card, cardValue + 1);
        }
    }
    else if (answer === AnswerDifficulty.HARD) {
        if (cardValue > 0) {
            bucketMap.set(card, cardValue - 1);
        }
    }
    else if (answer === AnswerDifficulty.WRONG) {
        bucketMap.set(card, 0);
    }

}

/**
 * Generate a hint about the back of a flashcard, to display if the user asks for it. 
 * The hint can not reveal the entire word.
 * Tests your crossword skills when you only have some letters of the entire word. 
 * 
 * @param card a flashcard.
 * @returns a hint revealing every second letter of the string and hiding the rest with underscores, or
 *          undefined if no possible hints can be given
 *          (e.g 'abcde' would return '_b_d_')
 */
export function getHint(card: Flashcard): string | undefined {
    const back = card.back;
    const length = back.length;

    let out: string | undefined = undefined;
    for (let i = 0; i < length; i++) {
        if (out === undefined) {
            out = "";
        }

        if (i % 2 == 0) {
            out += "_";
        }
        else {
            out += back[i];
        }
    }
    return out;
}

/**
 * helper function to compare dates for sorting
 * 
 * @param left      the first date we want to compare
 * @param right     the second date we want to compare
 * @returns         a number where 1 means that the first date is sorted after the right date, -1 means that the left date is sorted before the right date,
 *                  and 0 means to perserve the original order of the dates
 */
function sortDateComparator(left: { "date": Date, "bucketNum": number; }, right: { "date": Date, "bucketNum": number; }): number {
    if (left.date > right.date) {
        return 1;
    }
    else if (left.date < right.date) {
        return -1;
    }
    else {
        return 0;
    }
}

/**
 * helper function to compare numbers for sorting
 * 
 * @param left      the left side of the comparison
 * @param right     the right side of the comparison
 * @returns         a number where 1 means that the first number > the second number, -1 means that the left number < the right number,
 *                  and 0 means that they're equal
 */
function sortNumberComparator(left: number, right: number): number {
    if (left > right) {
        return 1;
    }
    else if (left < right) {
        return -1;
    }
    else {
        return 0;
    }
}

/**
 * helper function that gets the average value of all the elements of the array
 * 
 * @param arr  the array we want to look at
 * @returns    the average value of all elements in the array
 */
function getAverage(arr: Array<number>): number {
    let sum = 0;
    for (const element of arr) {
        sum += element;
    }
    return sum / arr.length;
}

/**
 * helper function that gets us the median of the values of the array
 * 
 * @param arr   the array we want to look at
 * @requires    the array to be sorted
 * 
 * @returns     the median value of the elements of the array
 */
function getMedian(arr: Array<number>): number {
    if (arr.length % 2 === 1) {
        const middleIndex = Math.ceil(arr.length / 2) - 1;
        return arr[middleIndex];
    }
    else {
        const rightmiddleIndex = arr.length / 2;
        const leftmiddleIndex = rightmiddleIndex - 1;
        return (arr[leftmiddleIndex] + arr[rightmiddleIndex]) / 2;
    }
}


/**
 * Calculates the average and median change in bucket positions per practice session.
 * A positive number is better as it shows that on average, you're improving every practice session
 * 
 * @param currentState  a list of disjoint sets representing learning buckets, where
 *                      buckets[i] is the set of cards in the ith bucket,
 *                      for all 0 <= i < buckets.length.
 * @param cardHistory   a map that stores each flashcard's past bucket numbers with their corresponding date.
 * @requires            every flashcard in the currentState buckets must have at least one past data point in the cardHistory map.
 * 
 * @returns a map that displays the average and median change of bucket positions for each flashcard
 * 
 */
export function computeProgress(currentState: Array<Set<Flashcard>>, cardHistory: Map<Flashcard, Array<{ "date": Date, "bucketNum": number; }>>):
    Map<Flashcard, { "average": number, "median": number; }> {  // can't return record type as Flashcard is neither a number, string, or symbol

    const mapping: Map<Flashcard, { "average": number, "median": number; }> = new Map();

    for (let bucketIndex = 0; bucketIndex < currentState.length; bucketIndex++) {
        for (const card of currentState[bucketIndex]) {
            const pastData: Array<{ "date": Date, "bucketNum": number; }> | undefined = cardHistory.get(card);

            // fail fast
            if (pastData === undefined || pastData.length === 0) {
                throw new Error("there exists a Flashcard in currentState that does not have at least one past data point in cardHistory");
            }

            const changes: Array<number> = []; // stores the differences of bucket values in between each practice session of a flashcard
            pastData.sort(sortDateComparator); // sorts past data in chronological order by dates

            for (let i = 0; i < pastData.length - 1; i++) {
                const difference = pastData[i + 1].bucketNum - pastData[i].bucketNum;
                changes.push(difference);
            }
            const currentDifference = bucketIndex - pastData[pastData.length - 1].bucketNum;
            changes.push(currentDifference);

            changes.sort(sortNumberComparator); // sort the 'changes' array by increasing order (required to find the median of array)

            const average = getAverage(changes);
            const median = getMedian(changes);

            mapping.set(card, { "average": average, "median": median });
        }
    }

    return mapping;

}

