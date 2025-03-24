import assert from 'assert';
import { parseExpression} from '../src/Parser';
import * as fs from 'fs';

describe('Parser', function() {
    
    /**
     *  TESTING STRATEGY:
     *  comments
          with; without
        solved star coordinates
          with; without
     */
    it('parsing sample puzzles (solved, +comments)', ()=>{
        const files = ["./puzzles/kd-1-1-1.starb", 
                       "./puzzles/kd-6-31-6.starb"];
        const stars = [new Set([2, 5, 
                                10+9, 30+10, 
                                20+2, 20+4, 
                                10+7, 30+8,
                                50+1, 80+1,
                                40+4, 40+6,
                                50+8, 70+7,
                                60+3, 60+5,
                                70+9, 90+10,
                                80+3, 90+6
                            ]), 
                       new Set([1, 21,
                                13, 25,
                                6, 18,
                                52, 44,
                                46, 38,
                                40, 60,
                                64, 72, 
                                85, 93,
                                67, 79,
                                87, 99
                            ])
                      ];

        for (const i of [0,1]){
          const filename = files[i]!;
          const filetext = fs.readFileSync(filename, { encoding: 'utf-8' });
          const puzzle = parseExpression(filetext);
          assert(puzzle.solved(), 'full puzzle should be solved');
          assert(puzzle.getRegions().length === puzzle.getDimension(), 'number of regions should match dimension');
        
          //check all the stars are in the puzzle
          const puzzleStars = puzzle.getStarredCells();
          for (const starNum of stars[i]!){
              assert(puzzleStars.has(starNum));
          }
          assert(puzzle.solved(), "full sample puzzle should be solved");
        }
    });

    it('parsing sample puzzle (solved, -comments)', ()=>{
      const file = `10x10
                    1,2  1,5  | 1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5
                    2,9  4,10 | 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10
                    3,2  3,4  | 3,3
                    2,7  4,8  | 3,6 3,7 3,8
                    6,1  9,1  | 3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6
                    5,4  5,6  | 4,5 5,5 6,4 6,5 6,6
                    6,8  8,7  | 4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8
                    7,3  7,5  | 6,3 7,4
                    8,9 10,10 | 7,9 9,9 9,10
                    9,3  10,6 | 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9
                    `;

      const stars = new Set([2, 5, 
                              10+9, 30+10, 
                              20+2, 20+4, 
                              10+7, 30+8,
                              50+1, 80+1,
                              40+4, 40+6,
                              50+8, 70+7,
                              60+3, 60+5,
                              70+9, 90+10,
                              80+3, 90+6
                          ]);
        const puzzle = parseExpression(file);
        assert(puzzle.solved(), 'full puzzle should be solved');
        assert(puzzle.getRegions().length === puzzle.getDimension(), 'number of regions should match dimension');
      
        //check all the stars are in the puzzle
        const puzzleStars = puzzle.getStarredCells();
        for (const starNum of stars){
            assert(puzzleStars.has(starNum));
        }
  });

  it('parsing sample puzzle (blank, -comments)', ()=>{
    const file = `10x10
                  | 1,2  1,5  1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5
                  | 2,9  4,10 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10
                  | 3,2  3,4  3,3
                  | 2,7  4,8  3,6 3,7 3,8
                  | 6,1  9,1  3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6
                  | 5,4  5,6  4,5 5,5 6,4 6,5 6,6
                  | 6,8  8,7  4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8
                  | 7,3  7,5  6,3 7,4
                  | 8,9 10,10 7,9 9,9 9,10
                  | 9,3  10,6 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9
                  `;

      const puzzle = parseExpression(file);
      assert(! puzzle.solved(), 'empty puzzle is not solved');
      assert(puzzle.getRegions().length === puzzle.getDimension(), 'number of regions should match dimension');
    
      //check all the stars are in the puzzle
      const puzzleStars = puzzle.getStarredCells();
      assert (puzzleStars.size === 0, 'no stars in the board');
  });

  it('parsing sample puzzle (blank, +comments)', ()=>{
    const file = `# here's a comment fjdkfjdkfjdkfj
                  10x10
                  | 1,2  1,5  1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5
                  | 2,9  4,10 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10
                  | 3,2  3,4  3,3
                  | 2,7  4,8  3,6 3,7 3,8
                  | 6,1  9,1  3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6
                  | 5,4  5,6  4,5 5,5 6,4 6,5 6,6
                  | 6,8  8,7  4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8
                  | 7,3  7,5  6,3 7,4
                  | 8,9 10,10 7,9 9,9 9,10
                  | 9,3  10,6 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9
                  `;

      const puzzle = parseExpression(file);
      assert(! puzzle.solved(), 'empty puzzle is not solved');
      assert(puzzle.getRegions().length === puzzle.getDimension(), 'number of regions should match dimension');
    
      //check all the stars are in the puzzle
      const puzzleStars = puzzle.getStarredCells();
      assert (puzzleStars.size === 0, 'no stars in the board');
  });

});


