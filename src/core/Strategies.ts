import { BoardSpace, GameMode,	IGameStrategy,	IMove,	PlayerSymbol } from './types';

export class InfinityStrategy implements IGameStrategy {
	readonly type = GameMode.INFINITY;
	processMove(board: BoardSpace[], move: {position: number, symbol: PlayerSymbol}, history: IMove[]) {
    let newBoard = [...board];
    let newHistory = [...history];
    const playerMoves = history.filter(m => m.symbol === move.symbol);
    if (playerMoves.length >= 3) {
      const oldestMove = playerMoves[0];
      newBoard[oldestMove.position] = null;
      newHistory = newHistory.filter(m => m !== oldestMove);
    }
    newBoard[move.position] = move.symbol;
    newHistory.push(move);
    return {
      newBoard,
      newHistory
    };
  }
  checkDraw() {
    return false; // No modo infinito não há empate por falta de espaço
  }
}

export class ClassicStrategy implements IGameStrategy {
	readonly type = GameMode.CLASSIC;
	processMove(board: BoardSpace[], move: {position: number, symbol: PlayerSymbol}, history: any[]) {
		const newBoard = [...board];
		newBoard[move.position] = move.symbol;
		return {
			newBoard,
			newHistory: [...history, move]
		};
	}
	checkDraw(board: BoardSpace[]) {
		return !board.includes(null);
	}
}