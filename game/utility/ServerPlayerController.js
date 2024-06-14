import { ServerActor } from '../actors/ServerActor.js';
import { log } from '../../shared/helpers.js';

export class ServerPlayerController {
  constructor(socket, actorManager) {
    this.socket = socket;
    this.actorManager = actorManager;
    this.actor = null;

    // Listen for player input updates from the client
    socket.on('playerInput', (data) => {
      this.handlePlayerInput(data);
    });

    // When a client connects, spawn an actor for them
    this.spawnActor();
  }

  spawnActor() {
    const initialPosition = { x: 100, y: 100 }; // Or some logic to determine spawn position
    const actorData = {
      id: this.socket.id,
      classType: "ClientActor",
      x: initialPosition.x,
      y: initialPosition.y,
      texture: 'ship', // Adjust as needed
      options: {
        roam: false,
      },
    };

    //log("calling this.actorManager.spawnActor(actorData)", actorData)
    this.actor = this.actorManager.spawnActor(actorData);
    //this.actorManager.actors.set(this.socket.id, this.actor);

    //this.actorManager.io.emit('actorSpawned', actorData);
  }

  handlePlayerInput(data) {
    // if (this.actor) {
    //   if (data.action === 'move') {
    //     this.actor.x += data.x;
    //     this.actor.y += data.y;
    //     this.actor.rotation = data.rotation || this.actor.rotation;
    //     this.actor.velocity = data.velocity || this.actor.velocity;
    //     this.actor.isThrusting = data.thrust || false;
    //     this.actor.setNeedsUpdate();
    //   }
    // }
  }

  // updateActor() {
  //   if (this.actor) {
  //     this.actor.update(0.016); // Assume 60 FPS for deltaTime
  //     this.actorManager.io.emit('actorUpdated', this.actor);
  //   }
  // }

  destroy() {
    if (this.actor) {
      this.actorManager.actors.delete(this.actor.id);
      this.actorManager.io.emit('actorDeleted', { id: this.actor.id });
      this.actor = null;
    }
  }
}
