import {
  AbstractAlternatingBlackWhiteOnGridVariant,
  AbstractAlternatingBlackWhiteOnGridVariantConfig,
  AbstractAlternatingBlackWhiteOnGridVariantState,
  makeGridWithValue,
  copyBoard,
  isOutOfBounds,
  Color,
} from "../abstractAlternatingBlackWhiteOnGrid";

export interface BadukConfig
  extends AbstractAlternatingBlackWhiteOnGridVariantConfig {
  komi: number;
}

export interface BadukState
  extends AbstractAlternatingBlackWhiteOnGridVariantState {
  captures: { 0: number; 1: number };
}

// TODO: Redundant code in super class file
interface Coordinate {
  readonly x: number;
  readonly y: number;
}

export class Baduk extends AbstractAlternatingBlackWhiteOnGridVariant<
  BadukConfig,
  BadukState
> {
  private captures = { 0: 0, 1: 0 };

  constructor(config: BadukConfig) {
    super(config);
  }

  override exportState(): BadukState {
    return {
      ...super.exportState(),
      captures: { 0: this.captures[0], 1: this.captures[1] },
    };
  }

  protected override playMoveInternal(move: Coordinate): void {
    super.playMoveInternal(move);
    const opponent_color = this.next_to_play === 0 ? Color.WHITE : Color.BLACK;
    neighboringPositions(move).forEach((pos) => {
      if (isOutOfBounds(pos, this.board)) {
        return;
      }
      if (
        this.board[pos.y][pos.x] === opponent_color &&
        !groupHasLiberties(pos, this.board)
      ) {
        this.captures[this.next_to_play] += removeGroup(pos, this.board);
      }
    });
  }

  protected override postValidateMove(move: Coordinate): void {
    // Detect suicide
    if (!groupHasLiberties(move, this.board)) {
      console.log(this.board);
      throw Error("Move is suicidal!");
    }
  }

  protected override prepareForNextMove(
    move: string,
    decoded_move?: Coordinate
  ): void {
    if (move == "pass" && this.last_move === "pass") {
      this.finalizeScore();
    } else {
      super.prepareForNextMove(move, decoded_move);
    }
  }

  private finalizeScore(): void {
    const board = copyBoard(this.board);
    const visited = makeGridWithValue(
      this.config.width,
      this.config.height,
      false
    );

    const determineController = (pos: Coordinate): Color => {
      if (isOutOfBounds(pos, board)) {
        return Color.EMPTY;
      }
      if (board[pos.y][pos.x] !== Color.EMPTY) {
        return board[pos.y][pos.x];
      }
      if (visited[pos.y][pos.x]) {
        return Color.EMPTY;
      }
      visited[pos.y][pos.x] = true;
      const neighbor_results =
        neighboringPositions(pos).map(determineController);
      const saw_white = neighbor_results.includes(Color.WHITE);
      const saw_black = neighbor_results.includes(Color.BLACK);
      if (saw_black && saw_white) {
        return Color.EMPTY;
      }
      if (saw_black) {
        return Color.BLACK;
      }

      if (saw_white) {
        return Color.WHITE;
      }
      return Color.EMPTY;
    };

    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (visited[y][x]) {
          continue;
        }
        if (board[y][x] === Color.EMPTY) {
          const controller = determineController({ x, y });
          floodFill({ x, y }, controller, board);
        }
      }
    }

    const black_points: number = countValueIn2dArray(Color.BLACK, board);
    const white_points: number =
      countValueIn2dArray(Color.WHITE, board) + this.config.komi;
    const diff = black_points - white_points;
    if (diff < 0) {
      this.result = `W+${-diff}`;
    } else if (diff > 0) {
      this.result = `B+${diff}`;
    } else {
      this.result = "Tie";
    }

    this.phase = "gameover";
  }

  // resign(player: number) {
  //   this.phase = "gameover";
  //   this.result = player === 0 ? "W+R" : "B+R";
  // }
}

/** Returns true if the group containing (x, y) has at least one liberty. */
function groupHasLiberties(pos: Coordinate, board: Color[][]) {
  const color = board[pos.y][pos.x];
  const width = board[0].length;
  const height = board.length;
  const visited = makeGridWithValue(width, height, false);

  function helper({ x, y }: Coordinate): boolean {
    if (isOutOfBounds({ x, y }, board)) {
      return false;
    }

    if (board[y][x] === Color.EMPTY) {
      // found a liberty
      return true;
    }
    if (color !== board[y][x]) {
      // opponent color
      return false;
    }
    if (visited[y][x]) {
      // Already seen
      return false;
    }
    visited[y][x] = true;
    return neighboringPositions({ x, y }).some(helper);
  }

  return helper(pos);
}

function neighboringPositions({ x, y }: Coordinate) {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ] as const;
}

/**
 * Removes the group containing pos, and returns the number of stones removed
 * from the board.
 */
function removeGroup(pos: Coordinate, board: Color[][]): number {
  return floodFill(pos, Color.EMPTY, board);
}

/** Fills area with the given color, and returns the number of spaces filled. */
function floodFill(
  pos: Coordinate,
  target_color: Color,
  board: Color[][]
): number {
  const starting_color = board[pos.y][pos.x];
  if (starting_color === target_color) {
    return 0;
  }

  function helper({ x, y }: Coordinate): number {
    if (isOutOfBounds({ x, y }, board)) {
      return 0;
    }

    if (starting_color !== board[y][x]) {
      return 0;
    }

    board[y][x] = target_color;

    return neighboringPositions({ x, y })
      .map(helper)
      .reduce((acc, val) => acc + val, 1);
  }

  return helper(pos);
}

/** Returns the number of occurrences for the given color */
function countValueIn2dArray<T>(value: T, array: T[][]) {
  return array.flat().filter((val) => val === value).length;
}
