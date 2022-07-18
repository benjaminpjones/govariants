import { AbstractGame, MovesType } from "../abstract_game";

export enum Color {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

export interface AbstractAlternatingBlackWhiteOnGridVariantConfig {
  width: number;
  height: number;
}

export interface AbstractAlternatingBlackWhiteOnGridVariantState {
  board: Color[][];
  next_to_play: 0 | 1;
}

interface Coordinate {
  readonly x: number;
  readonly y: number;
}

type AbstractAlternatingBlackWhiteOnGridVariantMovesType =
  | { 0: string }
  | { 1: string };

export abstract class AbstractAlternatingBlackWhiteOnGridVariant<
  TConfig extends AbstractAlternatingBlackWhiteOnGridVariantConfig,
  TState extends AbstractAlternatingBlackWhiteOnGridVariantState
> extends AbstractGame<TConfig, TState> {
  protected board: Color[][];
  protected next_to_play: 0 | 1 = 0;
  protected last_move = "";

  constructor(config: AbstractAlternatingBlackWhiteOnGridVariantConfig) {
    super(config as TConfig);
    this.board = makeEmptyBoard(config.width, config.height);
  }

  exportState(): TState {
    return {
      board: copyBoard(this.board),
      next_to_play: this.next_to_play,
    } as TState;
  }

  nextToPlay(): number[] {
    return [this.next_to_play];
  }

  playMove(moves: AbstractAlternatingBlackWhiteOnGridVariantMovesType): void {
    const { player, move } = getOnlyMove(moves);
    if (player != this.next_to_play) {
      throw Error(`It's not player ${player}'s turn!`);
    }

    this.preValidateMove(move);

    if (move != "pass") {
      const decoded_move = decodeMove(move);
      const { x, y } = decoded_move;
      if (isOutOfBounds(decoded_move, this.board)) {
        throw Error(
          `Move out of bounds. (move: ${decoded_move}, board dimensions: ${this.config.width}x${this.config.height}`
        );
      }
      if (this.board[y][x] != Color.EMPTY) {
        throw Error(
          `Cannot place a stone on top of an existing stone. (${this.board[y][x]} at (${x}, ${y}))`
        );
      }

      this.playMoveInternal(decoded_move);
      this.postValidateMove(decoded_move);
      this.prepareForNextMove(move, decoded_move);
    } else {
      this.prepareForNextMove(move);
    }
  }

  protected preValidateMove(move: string): void {}
  protected postValidateMove(move: Coordinate): void {}

  protected playMoveInternal(move: Coordinate): void {
    this.board[move.y][move.x] =
      this.next_to_play === 0 ? Color.BLACK : Color.WHITE;
  }

  protected prepareForNextMove(move: string, decoded_move?: Coordinate): void {
    this.next_to_play = this.next_to_play === 0 ? 1 : 0;
    this.last_move = move;
  }

  numPlayers(): number {
    return 2;
  }

  resign(player: number) {
    this.phase = "gameover";
    this.result = player === 0 ? "W+R" : "B+R";
  }
}

function makeEmptyBoard(width: number, height: number): Color[][] {
  return makeGridWithValue(width, height, Color.EMPTY);
}

export function makeGridWithValue<T>(
  width: number,
  height: number,
  value: T
): T[][] {
  return new Array(height).fill(null).map(() => new Array(width).fill(value));
}

export function copyBoard(board: Color[][]) {
  return board.map((row) => [...row]);
}

function decodeMove(move: string): Coordinate {
  return { x: decodeChar(move[0]), y: decodeChar(move[1]) };
}

// a: 0, b: 1, ... z: 25, A: 26, ... Z: 51
function decodeChar(char: string): number {
  const a = "a".charCodeAt(0);
  const z = "z".charCodeAt(0);
  const A = "A".charCodeAt(0);
  const Z = "Z".charCodeAt(0);
  const char_code = char.charCodeAt(0);
  if (char_code >= a && char_code <= z) {
    return char_code - a;
  }
  if (char_code >= A && char_code <= Z) {
    return char_code - A + 26;
  }

  throw `Invalid character in move: ${char} (${char_code})`;
}

/** Asserts there is exaclty one move, and returns it */
function getOnlyMove(moves: MovesType): { player: number; move: string } {
  const players = Object.keys(moves);
  if (players.length > 1) {
    throw Error(`More than one player: ${players}`);
  }
  if (players.length === 0) {
    throw Error("No players specified!");
  }
  const player = Number(players[0]);
  return { player, move: moves[player] };
}

export function isOutOfBounds({ x, y }: Coordinate, board: Color[][]): boolean {
  return board[y] === undefined || board[y][x] === undefined;
}
