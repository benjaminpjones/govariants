import { TicTacToe } from "./tictactoe";

test("Play a game", () => {
  const game = new TicTacToe({ height: 3, width: 3 });

  game.playMove({ 0: "00" });
  game.playMove({ 1: "11" });
  game.playMove({ 0: "20" });
  game.playMove({ 1: "10" });

  // X O X
  // - O -
  // - - -
  expect(game.exportState().board).toEqual([
    ["x", "o", "x"],
    [undefined, "o", undefined],
    [undefined, undefined, undefined],
  ]);

  game.playMove({ 0: "01" });

  // The game is still not over
  expect(game.phase).toBe("play");

  game.playMove({ 1: "12" });
  expect(game.exportState().board).toEqual([
    ["x", "o", "x"],
    ["x", "o", undefined],
    [undefined, "o", undefined],
  ]);

  expect(game.phase).toBe("gameover");
  expect(game.result).toBe("o won!");
});
