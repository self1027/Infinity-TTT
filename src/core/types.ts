export type PlayerSymbol = 'X' | 'O';

export type BoardSpace = PlayerSymbol | null;

export enum GameMode {
  CLASSIC = 'classic',
  INFINITY = 'infinity'
}

export interface IPlayer {
  readonly id: string;
  readonly name: string;
}

export interface IParticipant {
  player: IPlayer;
  symbol: PlayerSymbol;
}

// movimento individual no histórico
export interface IMove {
  position: number;
  symbol: PlayerSymbol;
}

export interface IGameStrategy {
  readonly type: GameMode;
  processMove(
    board: BoardSpace[], 
    move: IMove,
    history: IMove[]
  ): { newBoard: BoardSpace[], newHistory: IMove[] };
  
  checkDraw(board: BoardSpace[]): boolean;
}