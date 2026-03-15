import { randomUUID } from 'crypto';
import { Room } from './Room';
import { Matchmaker } from './Matchmaker';
import { IPlayer, GameMode, PlayerSymbol } from '../core/types';

export class RoomManager {
    private rooms: Map<string, Room> = new Map();
    private matchmaker = new Matchmaker();

    public findMatch(player: IPlayer, mode: GameMode): Room | null {
        const match = this.matchmaker.addToQueue(player, mode);
        if (!match) return null;

        const room = this.createNewRoom(mode);
        const [symbolP1, symbolP2] = this.getRandomlyAssignedSymbols();

        room.addPlayer(match.p1, symbolP1);
        room.addPlayer(match.p2, symbolP2);

        this.registerRoom(room);
        return room;
    }

    public createPrivateRoom(player: IPlayer, mode: GameMode): Room {
        const room = this.createNewRoom(mode);
        
        room.addPlayer(player, this.getRandomSymbol());
        
        this.registerRoom(room);
        return room;
    }

    public joinRoom(roomId: string, player: IPlayer): Room {
        const room = this.rooms.get(roomId);
        
        if (!room) throw new Error("Sala não encontrada");
        if (room.isFull()) throw new Error("Sala cheia");

        const opponentSymbol = this.getOppositeSymbol(room.participants[0].symbol);
        room.addPlayer(player, opponentSymbol);
        
        return room;
    }

    public disconnectPlayer(playerId: string): string | null {
        this.matchmaker.removeFromQueue(playerId);
        const roomId = this.findRoomIdByPlayerId(playerId);

        if (roomId) {
            this.rooms.delete(roomId);
            return roomId;
        }

        return null;
    }

    public getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    public getQueueCounts() {
        return {
            classic: this.matchmaker.getQueueLength('classic'),
            infinity: this.matchmaker.getQueueLength('infinity')
        };
    }

    private createNewRoom(mode: GameMode): Room {
        return new Room(randomUUID(), mode);
    }

    private registerRoom(room: Room): void {
        this.rooms.set(room.id, room);
    }

    private getRandomSymbol(): PlayerSymbol {
        return Math.random() > 0.5 ? 'X' : 'O';
    }

    private getOppositeSymbol(symbol: PlayerSymbol): PlayerSymbol {
        return symbol === 'X' ? 'O' : 'X';
    }

    private getRandomlyAssignedSymbols(): [PlayerSymbol, PlayerSymbol] {
        const s1 = this.getRandomSymbol();
        return [s1, this.getOppositeSymbol(s1)];
    }

    private findRoomIdByPlayerId(playerId: string): string | undefined {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.participants.some(p => p.player.id === playerId)) {
                return roomId;
            }
        }
        return undefined;
    }
}