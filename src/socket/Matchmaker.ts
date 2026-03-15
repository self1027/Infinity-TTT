import { GameMode, IPlayer } from '../core/types';

export class Matchmaker {
    private queues: Map<GameMode, IPlayer[]> = new Map();

    constructor() {
        this.initializeQueues();
    }

    public addToQueue(player: IPlayer, mode: GameMode): { p1: IPlayer, p2: IPlayer } | null {
        const queue = this.getQueue(mode);

        if (this.isPlayerInQueue(player.id, queue)) return null;

        queue.push(player);

        if (this.canCreateMatch(queue)) {
            return this.extractMatchPair(queue);
        }

        return null;
    }

    public removeFromQueue(playerId: string): void {
        this.queues.forEach((queue, mode) => {
            const filteredQueue = queue.filter(p => p.id !== playerId);
            this.queues.set(mode, filteredQueue);
        });
    }

    public getQueueLength(mode: string): number {
        const queue = this.queues.get(mode as GameMode);
        return queue?.length ?? 0;
    }

    private initializeQueues(): void {
        this.queues.set(GameMode.CLASSIC, []);
        this.queues.set(GameMode.INFINITY, []);
    }

    private getQueue(mode: GameMode): IPlayer[] {
        return this.queues.get(mode)!;
    }

    private isPlayerInQueue(playerId: string, queue: IPlayer[]): boolean {
        return queue.some(p => p.id === playerId);
    }

    private canCreateMatch(queue: IPlayer[]): boolean {
        return queue.length >= 2;
    }

    private extractMatchPair(queue: IPlayer[]): { p1: IPlayer, p2: IPlayer } {
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;
        return { p1, p2 };
    }
}