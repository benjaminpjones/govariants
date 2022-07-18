import {
  AbstractAlternatingBlackWhiteOnGridVariant,
  AbstractAlternatingBlackWhiteOnGridVariantConfig,
  AbstractAlternatingBlackWhiteOnGridVariantState,
  Color,
} from "../abstractAlternatingBlackWhiteOnGrid";

// simpler names for config and state
export interface TicTacToeState
  extends AbstractAlternatingBlackWhiteOnGridVariantState {}
export interface TicTacToeConfig
  extends AbstractAlternatingBlackWhiteOnGridVariantConfig {}

interface Coordinate {
  x: number;
  y: number;
}

// positions will be stored as two character string of digits (e.g. "01", "20"),
// so these digits can't go past 9
const MAX_SIZE = 10;

export class TicTacToe extends AbstractAlternatingBlackWhiteOnGridVariant<
  TicTacToeConfig,
  TicTacToeState
> {
  constructor(config: TicTacToeConfig) {
    super(config as AbstractAlternatingBlackWhiteOnGridVariantConfig);
  }

  protected override preValidateMove(move: string): void {
    if (move === "pass") {
      throw Error("Passing is not allowed.");
    }
  }

  protected override prepareForNextMove(
    move: string,
    decoded_move?: Coordinate
  ): void {
    if (!decoded_move) {
      // decoded_move is expected in this sub class
      throw Error(
        "Expected decoded_move to be provided. This is likely due to a faulty implementation."
      );
    }

    const player_color = this.next_to_play === 0 ? Color.BLACK : Color.WHITE;

    // check if there was a win
    const column_win = this.board.every(
      (row) => row[decoded_move.x] === player_color
    );
    const row_win = this.board[decoded_move.y].every(
      (space) => space === player_color
    );
    const diagonal_win = this.board.every(
      (row, idx) => row[idx] === player_color
    );
    const antidiagonal_win = this.board.every(
      (row, idx) => row[this.config.height - idx - 1] === player_color
    );

    if (column_win || row_win || diagonal_win || antidiagonal_win) {
      this.result = `${player_color} won!`;
      this.phase = "gameover";
      return;
    } else if (
      this.board.every((row) => row.every((space) => space !== Color.EMPTY))
    ) {
      // if board was filled
      this.result = `Tie`;
      this.phase = "gameover";
    } else {
      super.prepareForNextMove(move, decoded_move);
    }
  }
}
