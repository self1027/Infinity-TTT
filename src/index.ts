import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { initSocketHandlers } from './socket/SocketHandler';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, '../public')));

initSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`sever on ${PORT}`));