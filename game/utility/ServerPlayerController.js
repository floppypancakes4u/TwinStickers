import { ServerActor } from '../actors/ServerActor.js';
import { log } from '../../shared/Helpers.js';
import { ActorManagerServer } from '../actors/ActorManagerServer.js';

export class ServerPlayerController {
  constructor(socket, actorManager) {
    this.socket = socket;
    this.actor = null;

    // Listen for player input updates from the client
    socket.on('playerInput', (data) => {
      this.handlePlayerInput(data);
    });

    // When a client connects, spawn an actor for them
    //this.spawnActor();
  }

  setPlayerActor(actor) {
    this.actor = actor;
    //log.debug("Set player actor to", actor)
  }

  spawnActor() {
    const initialPosition = { x: 100, y: 100 }; // Or some logic to determine spawn position
    const actorData = {
      //id: this.socket.id,
      serverClassType: "ServerActor",
      clientClassType: "ClientActor",
      x: initialPosition.x,
      y: initialPosition.y,
      texture: 'ship', // Adjust as needed
      options: {
        roam: false,
      },
    };

    this.actor = ActorManagerServer.spawnActor(actorData);
    this.actor.setController(this);

    // Spawn a test roid for us
    const roidData = {
      x: 75,
      y: 75,
      serverClassType: "ServerAsteroid",
      clientClassType: "ClientAsteroid",
    }
    this.roid = ActorManagerServer.spawnActor(roidData);
  }

  handlePlayerInput(data) {}

  destroy() {
    if (this.actor) {
      ActorManagerServer.deleteActor(this.socket, this.actor);
      this.actor = null;
    }
  }
}
