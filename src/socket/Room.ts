import { IPlayer, IParticipant, PlayerSymbol, GameMode } from '../core/types';
import { Game } from '../core/Game';
import { ClassicStrategy, InfinityStrategy } from '../core/Strategies';

export class Room {
    public participants: IParticipant[] = [];
    public game: Game;
    public rematchRequests: Set<string> = new Set();

    constructor(public readonly id: string, public readonly mode: GameMode) {
        this.game = this.initializeNewGame();
    }

    public addPlayer(player: IPlayer, symbol: PlayerSymbol): void {
        if (this.isFull()) throw new Error("Room is full");
        this.participants.push({ player, symbol });
    }

    public isFull(): boolean {
        return this.participants.length >= 2;
    }

    public resetGame(): void {
        this.rematchRequests.clear();
        this.shuffleParticipantsSymbols();
        this.game = this.initializeNewGame();
    }

    public getParticipantBySymbol(symbol: PlayerSymbol): IParticipant | undefined {
        return this.participants.find(p => p.symbol === symbol);
    }

    private initializeNewGame(): Game {
        const strategy = this.createStrategyByMode(this.mode);
        return new Game(strategy);
    }

    private createStrategyByMode(mode: GameMode) {
        return mode === GameMode.INFINITY 
            ? new InfinityStrategy() 
            : new ClassicStrategy();
    }

    private shuffleParticipantsSymbols(): void {
        if (this.participants.length < 2) return;

        const p1Starts = Math.random() > 0.5;
        this.participants[0].symbol = p1Starts ? 'X' : 'O';
        this.participants[1].symbol = p1Starts ? 'O' : 'X';
    }
}