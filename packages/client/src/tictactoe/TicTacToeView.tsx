import { GameViewProps } from "../view_types";
import { map2d, GridBoard, Stone } from "../boards";
import { TicTacToeState, Color } from "@ogfcommunity/variants-shared";

export function TicTacToeView({
  gamestate,
  onMove,
}: GameViewProps<TicTacToeState>) {
  // We could implement a tic tac toe board, but since this is a go variants
  // server, might as well use a Go board :)
  // The following statement turns Xs and Os into something GridBoard can
  // understand
  const processed_board: Stone[][] = map2d(gamestate.board, (color) => {
    switch (color) {
      case Color.BLACK:
        return { color: "black" };
      case Color.WHITE:
        return { color: "white" };
      case Color.EMPTY:
        return {};
    }
  });
  const onClick = (pos: { x: number; y: number }) => {
    onMove({ [gamestate.next_to_play]: coordsToLetters(pos.x, pos.y) });
  };

  return <GridBoard board={processed_board} onClick={onClick} />;
}

function coordsToLetters(x: number, y: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[x] + alphabet[y];
}
