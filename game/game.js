// import { ActorManager } from './actors/actor.js';
import { ActorManagerServer } from './actors/ActorManagerServer.js';

export function Init(io) {
  io.on('connection', (socket) => {
    //console.log('a user connected');

    socket.on('disconnect', () => {
      //console.log('user disconnected');
    });

    // Handle other socket events here
  });

  // WebSocket handling
  // wss.on('connection', (ws) => {
  //   console.log('Client connected');

  //   ws.on('open', function (event) {
  //     console.log('New client connected');
  //     // Send a message to the server
  //     socket.send('Client event: ', event);
  //   });

  //   ws.on('message', (message) => {
  //     console.log('Received:', message);
  //   });

  //   ws.on('close', () => {
  //     console.log('Client disconnected');
  //   });
  // });

  ActorManagerServer.init(io);
}
