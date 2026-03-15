import { BoardSpace, IGameStrategy, PlayerSymbol } from './types';

export class Game {
  public board: BoardSpace[] = Array(9).fill(null);
  public moveHistory: { position: number, symbol: PlayerSymbol }[] = [];
  public turn: PlayerSymbol = 'X';
  public winner: PlayerSymbol | 'DRAW' | null = null;
  public winPattern: number[] | null = null;

  constructor(public strategy: IGameStrategy) { }

  public makeMove(position: number, symbol: PlayerSymbol): boolean {
    if (this.board[position] !== null || this.turn !== symbol || this.winner) {
      return false;
    }

    const { newBoard, newHistory } = this.strategy.processMove(
      this.board, 
      { position, symbol },
      this.moveHistory
    );

    this.board = newBoard;
    this.moveHistory = newHistory;

    const winningPattern = this.getWinningPattern();

    if (winningPattern) {
      this.winner = symbol;
      this.winPattern = winningPattern;
      return true;
    }

    if (this.strategy.checkDraw(this.board)) {
      this.winner = 'DRAW';
      return true;
    }

    this.turn = this.turn === 'X' ? 'O' : 'X';
    return true;
  }

  private getWinningPattern(): number[] | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return pattern;
      }
    }
    return null;
  }
}