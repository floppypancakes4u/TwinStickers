import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { Init } from './game/game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'static' folder
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve files from 'shared' directory under '/static/shared'
app.use('/static/shared', express.static(path.join(__dirname, 'shared')));

// Serve index.html from 'pages' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  Init(io);
});
