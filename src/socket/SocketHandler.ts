import { Server, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { GameMode, IPlayer } from '../core/types';

const roomManager = new RoomManager();

export const initSocketHandlers = (io: Server) => {
    
    const broadcastQueueStatus = () => {
        io.emit('queue_update', roomManager.getQueueCounts());
    };

    io.on('connection', (socket: Socket) => {
        broadcastQueueStatus();

        socket.on('create_private', ({ name, mode }: { name: string, mode: GameMode }) => {
            const player: IPlayer = { id: socket.id, name };
            const room = roomManager.createPrivateRoom(player, mode);
            socket.join(room.id);
            socket.emit('room_created', { roomId: room.id });
        });

        socket.on('join_game', ({ name, mode, roomId }: { name: string, mode: GameMode, roomId?: string }) => {
            const player: IPlayer = { id: socket.id, name };
            try {
                const room = roomId 
                    ? roomManager.joinRoom(roomId, player) 
                    : roomManager.findMatch(player, mode);

                if (room) {
                    socket.join(room.id);
                    if (room.isFull()) startGame(io, room);
                }
            } catch (error: any) {
                socket.emit('error_msg', error.message);
            }
        });

        socket.on('make_move', ({ position, roomId }: { position: number, roomId: string }) => {
            const room = roomManager.getRoom(roomId);
            const participant = room?.participants.find(p => p.player.id === socket.id);

            if (room && participant && room.game.makeMove(position, participant.symbol)) {
                io.to(room.id).emit('update_game', {
                    board: room.game.board,
                    turn: room.game.turn,
                    history: room.game.moveHistory,
                    winner: room.game.winner,
                    winPattern: room.game.winPattern
                });
            }
        });

        socket.on('request_rematch', ({ roomId }) => {
            const room = roomManager.getRoom(roomId);
            if (!room || !room.game.winner) return;

            // o set já existe na classe
            room.rematchRequests.add(socket.id);

            if (room.rematchRequests.size === 2) { // os 2 aceitaram
                room.resetGame();
                startGame(io, room);
                return;
            }

            socket.to(room.id).emit('rematch_requested');
        });

        socket.on('disconnect', () => {
            const closedRoomId = roomManager.disconnectPlayer(socket.id);
            if (closedRoomId) {
                io.to(closedRoomId).emit('opponent_left');
            }
            broadcastQueueStatus();
        });
    });
};


function startGame(io: Server, room: any) {
    const gameState = {
        board: room.game.board,
        turn: room.game.turn,
        history: room.game.moveHistory,
        winner: room.game.winner,
        winPattern: room.game.winPattern
    };

    room.participants.forEach((p: any) => {
        const socket = io.sockets.sockets.get(p.player.id);
        if (!socket) return;

        socket.join(room.id); 

        const opponent = room.participants.find((opp: any) => opp.player.id !== p.player.id);
        
        socket.emit('game_start', { 
            roomId: room.id, 
            symbol: p.symbol,
            mode: room.game.strategy.type,
            opponentName: opponent?.player.name || "Oponente",
            initialState: gameState
        });
    });

    // Envia para todos na sala
    io.to(room.id).emit('update_game', gameState);
}