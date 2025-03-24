/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import fs from 'fs';

/**
 * An object representing a card. Has the following attributes:
 * 
 *      controlled: if a card is controlled, this will have the player's id string, else undefined
 *      faceState: either face up, face down, or empty
 *      blockQueue: a queue for if other players want to also control this card. holds resolve and reject functions to respond to the corresponding promise
 */
type Card = {
    controlled: string | undefined,
    faceState: FaceState,
    blockQueue: Array<{ resolveFunc: () => void, rejectFunc: () => void; }>;
};

/**
 * An object representing a player. Has the following attributes:
 *  
 *      card1: the first card the player is holding
 *      card2: the second card the player is holding
 *      blocked: whether or not the player is currently blocked from making moves
 *      relinquished: the list of cards that the player has reliquished control of, that will be flipped back face down if no other player controls them
 */
type Player = {
    card1: number | undefined,
    card2: number | undefined,
    blocked: boolean, relinquished: Array<number>;
};

enum FaceState {
    FaceUp, FaceDown, Empty
}

enum CardStage {
    First, Second, Third
}

/**
 * represents a board of the game
 * the board keeps tracks of the different cards in each position, what cards are being held by which player,
 * the names of each card, and the order of operations each player has on a card
 * 
 * also contains Card objects and Player objects
 * 
 * Mutable and concurrency safe.
 */
export class Board {

    // for all the arrays, the top-left card is index 0. The indexes then increase from left to right, top to down

    // 'board' stores the names of each card
    private board: Array<string>;

    private readonly width: number;
    private readonly height: number;

    // 'playerState' represents a each player's state in the game
    private readonly playerState: Map<string, Player> = new Map();

    // 'boardState' represents the state of each card on the board: 
    private readonly boardState: Array<Card>;

    // 'watchQueue' stores all blocking watch()'s in the order they were received
    private watchQueue: Array<() => void> = [];



    // Abstraction function:
    //  AF(width, height, board) = A board of width 'width' and height 'height' of cards. 
    //                             The cards are contained and ordered in 'board' from left to right. 
    //                             The ordering in 'board' corresponds to the ordering of the game where the 1st position is 
    //                             the top left corner, and increases from left to right, then from top to down.
    //                             Specifically, the index of a card in 'board' is equal to *row* + *col* + 'width'. 
    //                             *row* and *col* are the position coordinates for a card in our board.
    //                              
    // Representation invariant:
    //      * a player can't have a second card, if they don't have a first card;
    //      * the length of all arrays must be <= width * height
    //      * a player can't hold two of the same card (reference equality)
    //      * any card can only be held my one player (by reference, not value)
    //      * if a card is controlled, its FaceState can only be FaceUp
    //      * If a player is controlling a card, then the card should have that player as it's 'controlled'
    // Safety from rep exposure:
    //      width, height are readonly, private and immutable
    //      playerState, boardState are private readonly
    //      board and watchqueue are private
    //      all mutable containers can only be accessed and modified with our function flip()
    //      none of our mutable container references are returned to the client


    public constructor(width: number, height: number, board: Array<string>) {
        this.width = width;
        this.height = height;
        this.board = board;

        // initializes the boardState with all cards being not controlled, face down, and no block queue
        this.boardState = [...new Array(width * height)].map(() => {
            return {
                controlled: undefined,
                faceState: FaceState.FaceDown,
                blockQueue: []
            };
        });
    }


    // checks the rep
    private checkRep(): void {
        assert(this.board.length <= this.width * this.height);
        assert(this.boardState.length <= this.width * this.height);

        const seen: Array<number> = [];

        for (const [name, playerObject] of this.playerState) {
            if (playerObject.card2 !== undefined) {
                assert(playerObject.card1 !== undefined);
                assert(playerObject.card1 !== playerObject.card2);
                assert((this.boardState[playerObject.card2] ?? assert.fail("trying to access out of bounds card")).controlled === name);
                assert(!seen.includes(playerObject.card2));
                seen.push(playerObject.card2);
            }

            if (playerObject.card1 !== undefined) {
                assert((this.boardState[playerObject.card1] ?? assert.fail("trying to access out of bounds card")).controlled === name);
                assert(!seen.includes(playerObject.card1));
                seen.push(playerObject.card1);
            }
        }

        for (const card of this.boardState) {
            if (card.controlled !== undefined) {
                assert(card.faceState === FaceState.FaceUp);
            }
        }
    }


    /**
     * converts (row,col) coordinate to an index position for our rep
     * the translation goes:  index = row + col * WIDTH 
     * position 0 is the top left corner. the positions increase by 1 from left to right, then top to down
     * 
     * @param row  the row of the cell
     * @param column  the column of the cell
     * @returns the corresponding index position in my rep
     */
    private convertToPosition(row: number, column: number): number {
        return row * this.width + column;
    }



    /**
     * returns what current stage the player is in for flipping cards
     * Note: 'playerId' must already be in 'playerState' map 
     * 
     * @param playerId  is the player's id
     * @returns the player's current CardStage
     */
    private getPlayerCardStage(playerId: string): CardStage {
        const playerInfo = this.getPlayer(playerId);

        if (playerInfo.card1 === undefined && playerInfo.relinquished.length === 0) {
            return CardStage.First;
        } else if (playerInfo.card2 === undefined && playerInfo.relinquished.length === 0) {
            return CardStage.Second;
        } else {
            return CardStage.Third;
        }
    }

    /**
     * returns the object that is associated with a card in that position
     * 
     * @param position  the index of the card's location in my rep
     * @returns  the Card object
     */
    private getCard(position: number): Card {
        return this.boardState[position] ?? assert.fail('you tried to get a card that was out of bounds');
    }


    /**
     * returns the object that is associated with the player 
     * Note: player must already be in the 'playerState'
     * 
     * @param playerId  is the player's id
     * @returns the Player object
     */
    private getPlayer(playerId: string): Player {
        const player = this.playerState.get(playerId) ?? assert.fail('precondition failed; player not in playerState');
        return player;
    }


    /**
     * gets the name of the card at a given position
     * 
     * @param position  the index of the card's location in my rep
     * @returns  the string representing the name of that card
     */
    private getCardName(position: number): string {
        return this.board[position] ?? assert.fail('error on trying to access a card that is out of bounds of the board');
    }

    /**
     * blocks the player from flipping any more cards
     *  
     * @param playerId  is the player's id
     */
    private blockPlayer(playerId: string): void {
        const player = this.getPlayer(playerId);
        player.blocked = true;
    }


    /**
     * unblocks the player allowing them to flip more cards
     * 
     * @param playerId  is the player's id
     */
    private unblockPlayer(playerId: string): void {
        const player = this.getPlayer(playerId);
        player.blocked = false;
    }



    /**
     * Gives the player control of the card for first stage actions
     * Mutates the 'boardState'
     * 
     * @param playerId  is the player's id
     * @param position  the index of the card's location in my rep
     */
    private addControlFirst(playerId: string, position: number): void {
        const card = this.getCard(position);
        const player = this.getPlayer(playerId);

        card.faceState = FaceState.FaceUp;
        card.controlled = playerId;

        player.card1 = position;
    }



    /**
     * Gives the player control of the card for second stage actions.
     * Then this resolves the matching phase of the two cards the player controls
     * 
     * @param playerId  is the player's id
     * @param position  the index of the card's location in my rep
     */
    private addControlSecond(playerId: string, position: number): void {
        const card = this.getCard(position);
        const player = this.getPlayer(playerId);

        card.faceState = FaceState.FaceUp;
        card.controlled = playerId;


        player.card2 = position;

        const card1Position: number = player.card1 ?? assert.fail("At this CardStage, the player should already have a first card");

        const card1Name: string = this.getCardName(card1Position);
        const card2Name: string = this.getCardName(position);

        if (card1Name !== card2Name) {
            // order matters here, as checkRep() should make sure that we have a 'card1' before having a 'card2'
            this.relinquishControl(playerId, position);
            this.relinquishControl(playerId, card1Position);
        }

        // if 'card1Name' and 'card2Name' are equal, then the player keeps control of both cards (which is already what is being done here)
    }



    /**
     * Given a card position, set if face down if it's not being controlled and it's not empty
     * 
     * @param position  the index of the card's location in my rep
     */
    private setFaceDown(position: number): void {
        const tempCard = this.getCard(position);
        if (tempCard.controlled === undefined && tempCard.faceState !== FaceState.Empty) {
            tempCard.faceState = FaceState.FaceDown;
        }
    }


    /**
     * a function meant to relinquish control of the cards when the cards were NOT matched by the player
     * 
     * @param playerId  is the player's id
     * @param position  the index of the card's location in my rep
     */
    private relinquishControl(playerId: string, position: number): void {
        const player = this.getPlayer(playerId);
        const card = this.getCard(position);

        // relinquished cards still maintain face up
        card.faceState = FaceState.FaceUp;

        // reset the card from player's control
        if (player.card2 === position) {
            player.card2 = undefined;
        } else if (player.card1 === position) {
            player.card1 = undefined;
        } else {
            assert.fail("neither 'card1' nor 'card2' contained this card.");
        }

        // reflect that the card isn't controlled anymore on the boardState
        card.controlled = undefined;

        // add card to relinquished
        player.relinquished.push(position);

        // now that we've relinquished control of this card, we can let the other cards have a turn
        if (card.blockQueue.length > 0) {
            (card.blockQueue.shift() ?? assert.fail("blockQueue has >0 length, but first element was undefined")).resolveFunc();
        }

    }



    public async flip(playerId: string, row: number, column: number): Promise<string> {

        // initialize player if they don't exist
        if (this.playerState.get(playerId) === undefined) {
            this.playerState.set(playerId, { card1: undefined, card2: undefined, blocked: false, relinquished: [] });
        }

        const player = this.getPlayer(playerId);

        // blocked users don't get to make moves
        if (player.blocked) {
            return this.getStateString(playerId);
        }

        const stage: CardStage = this.getPlayerCardStage(playerId);
        const cardPosition: number = this.convertToPosition(row, column);
        const card = this.getCard(cardPosition);

        // this Promise figures out our response based on the inputs
        const promise: Promise<string> = new Promise(async (resolve, reject) => {

            switch (stage) {
                case CardStage.First:

                    // When there is no card there
                    if (card.faceState === FaceState.Empty) {
                        reject();
                    }

                    // Card is face down    
                    else if (card.faceState === FaceState.FaceDown) {
                        this.addControlFirst(playerId, cardPosition);
                        this.triggerWatch();
                        resolve(this.getStateString(playerId));
                    }

                    // card is face up but not controlled
                    else if (card.faceState === FaceState.FaceUp && card.controlled === undefined) {
                        this.addControlFirst(playerId, cardPosition);
                        resolve(this.getStateString(playerId));
                    }

                    // card is face up but IS controlled
                    else if (card.faceState === FaceState.FaceUp && card.controlled !== undefined) {

                        // add this player to blockQueue of the card
                        const blockQueuePromise: Promise<void> = new Promise((resolve, reject) => {
                            card.blockQueue.push({ resolveFunc: resolve, rejectFunc: reject });
                        });
                        this.blockPlayer(playerId);

                        try {
                            await blockQueuePromise;

                            this.unblockPlayer(playerId);
                            this.addControlFirst(playerId, cardPosition);
                            resolve(this.getStateString(playerId));
                        }

                        // If the blocked card is no longer claimable (e.g. the card position is now Empty), then we Error
                        catch (err) {
                            this.unblockPlayer(playerId);
                            reject();
                        }

                    } else {
                        assert.fail("we didn't match any of the faceState cases, which means there's a problem");
                    }

                    break;


                case CardStage.Second:

                    // When there is no card there
                    if (card.faceState === FaceState.Empty) {
                        const firstCard: number = player.card1 ?? assert.fail("At this CardStage, the player should already have a first card");
                        this.relinquishControl(playerId, firstCard);
                        reject();
                    }

                    // card is face up and IS controlled. avoid deadlock so no block and fail
                    else if (card.faceState === FaceState.FaceUp && card.controlled !== undefined) {
                        const firstCard: number = player.card1 ?? assert.fail("At this CardStage, the player should already have a first card");
                        this.relinquishControl(playerId, firstCard);
                        reject();
                    }

                    // card is face down
                    else if (card.faceState === FaceState.FaceDown) {
                        this.addControlSecond(playerId, cardPosition);
                        this.triggerWatch();

                        resolve(this.getStateString(playerId));
                    }

                    // card is face up and not controlled by a player
                    else if ((card.faceState === FaceState.FaceUp && card.controlled === undefined)) {
                        this.addControlSecond(playerId, cardPosition);

                        resolve(this.getStateString(playerId));

                    } else {
                        assert.fail("we didn't match any of our FaceState cases, therefore problem");
                    }

                    break;

                case CardStage.Third:

                    // If our player has relinquished cards in the previous stage
                    if (player.relinquished.length > 0) {

                        // turn the relinquished cards with no controllers face down
                        for (const position of player.relinquished) {
                            this.setFaceDown(position);
                        }

                        // reset the relinqiushed list for the player
                        player.relinquished = [];

                        this.triggerWatch();

                        // recursively call flip() on the card they just selected
                        try {
                            const result = await this.flip(playerId, row, column);
                            resolve(result);
                        }

                        // if that card is not flippable (e.g. we're trying to flip an Empty spot), then we Error
                        catch (err) {
                            reject();
                        }
                    }

                    // for if our player finds a matching
                    else if (player.card1 !== undefined && player.card2 !== undefined) {

                        const cardOne = this.getCard(player.card1);
                        const cardTwo = this.getCard(player.card2);

                        // making the cards empty and uncontrolled on the boardState
                        cardOne.faceState = FaceState.Empty;
                        cardTwo.faceState = FaceState.Empty;
                        cardOne.controlled = undefined;
                        cardTwo.controlled = undefined;

                        // removing the cards from the player's control
                        player.card1 = undefined;
                        player.card2 = undefined;

                        // reset the player's relinquished list
                        player.relinquished = [];

                        // reject all blocking players who were blocking on these two cards
                        for (const promiseFunc of cardOne.blockQueue) {
                            promiseFunc.rejectFunc();
                        }
                        for (const promiseFunc of cardTwo.blockQueue) {
                            promiseFunc.rejectFunc();
                        }

                        this.triggerWatch();

                        // recursively call flip() on the card the user just pressed
                        try {
                            const result = await this.flip(playerId, row, column);
                            resolve(result);
                        }

                        // if that card is not flippable (e.g. we're trying to flip an Empty spot), then we Error
                        catch (err) {
                            reject();
                        }

                    } else {
                        assert.fail("none of the FaceStates match so we have a problem");
                    }

                    break;

                default:
                    assert.fail("CardStage was neither First, Second, or Third");
            }

        });

        return promise;
    }



    /**
     * Modifies board by replacing every card with f(card), without affecting other state of the game.
     * 
     * @param playerId  is the player's id
     * @param f  the function that transforms the cards
     * @returns the state of the board, as described in the ps4 handout
     */
    public async map(playerId: string, f: (card: string) => Promise<string>): Promise<string> {
        this.board = await Promise.all(this.board.map(f)); // reassigns the board, so no aliasing
        this.triggerWatch(); // identity function doesn't count for watch
        return this.getStateString(playerId);
    }



    /**
     * triggers all pending watch() calls
     */
    private triggerWatch(): void {
        this.watchQueue.forEach((f) => { f(); });
        this.watchQueue = [];
    }



    /**
     * Watches the board for a change, blocking until any cards turn face up or face down, 
     * are removed from the board, or change from one string to a different string.
     * 
     * @param playerId ID of player watching the board; 
     * 
     */
    public async watch(playerId: string): Promise<string> {

        // applicable rules that we need to change for watch():

        // add all the applicable rules:
        // 1-B : face down -> face up
        // 2-CDE : you have to check if the card was face down first or not (can probably be easily done with copy paste and making a new branch (2-C vs other))
        //              cuz like they both do the same thing anyway (calling addControlSecond())
        // 3-A: cards are removed from the board
        // 3-B: cards are flipped face back down if no one controls
        // map(): cards strings change

        const promise: Promise<void> = new Promise((resolve, reject) => {
            this.watchQueue.push(resolve);
        });

        await promise;
        return this.getStateString(playerId);
    }



    /**
     * returns the state of the board in the format described in the ps4 handout (linked below)
     * http://web.mit.edu/6.102/www/sp23/psets/ps4/#@board_state_row 
     * 
     * note: playerId does NOT have to be in playerState
     * @param playerId  the id of the player
     * 
     * @returns the state of the game the player is currently in
     */
    public getStateString(playerId: string): string {

        let out = `${this.height}x${this.width}\n`;
        for (let i = 0; i < this.width * this.height; ++i) {
            const name: string = this.getCardName(i);
            const card = this.getCard(i);

            if (card.faceState === FaceState.FaceDown) {
                out += "down\n";
            } else if (card.faceState === FaceState.Empty) {
                out += "none\n";
            } else if (card.faceState === FaceState.FaceUp && card.controlled === playerId) {
                out += `my ${name}\n`;
            } else if (card.faceState === FaceState.FaceUp) {
                out += `up ${name}\n`;
            } else {
                assert.fail("we're not hitting any of these FaceStates, which shouldn't happen");
            }
        }

        return out;
    }

    public toString(): string {
        return this.board.toString();
    }

    /**
     * Make a new board by parsing a file.
     * 
     * PS4 instructions: the specification of this method may not be changed.
     * 
     * @param filename path to game board file
     * @returns (a promise for) a new board with the size and cards from the file
     * @throws Error if the file cannot be read or is not a valid game board
     */
    public static async parseFromFile(filename: string): Promise<Board> {
        const file: string = await fs.promises.readFile(filename, { encoding: 'utf-8' });

        const regex = /[^\s\n\r]+/g;
        const words = file.match(regex) ?? assert.fail("file string did not match any cards");
        const dimensions = (words[0] ?? assert.fail("file doesn't have dimensions as first line")).split('x');

        const width = Number(dimensions[1]);
        const height = Number(dimensions[0]);

        if (isNaN(width)) {
            assert.fail('given width is NaN');
        }
        if (isNaN(height)) {
            assert.fail('given height is NaN');
        }

        return new Board(width, height, words.slice(1, width * height + 1));
    }
}
