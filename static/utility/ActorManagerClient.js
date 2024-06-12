import { log } from '../shared/helpers.js';
import { ClientActor } from '../classes/ClientActor.js';

export const ActorManagerClient = {
  socket: null,
  scene: null,
  actors: new Map(),
  controllerRef: null,

  init(scene) {
    log.debug('Init ActorManagerClient');
    this.socket = scene.socket;
    this.scene = scene;

    this.socket.on('actorSpawned', (data) => {
      log.debug("ActorManagerClient got actorSpawned", data)
      this.spawnActor(data);
    });

    this.socket.on('actorDeleted', (data) => {
      this.deleteActor(data);
    });

    this.socket.on('actorUpdated', (data) => {
      this.updateActor(data);
    });

    // const deltaTime = 0.016; // Approximate time between frames (60 FPS)
    // setInterval(() => {
    //   this.update(deltaTime);
    // }, deltaTime * 1000); // 16ms for 60 FPS
  },

  setController(controller) {
    this.controllerRef = controller;
  },

  getActorByID(id) {
    if (this.actors.has(id)) {
      return this.actors.get(id);
    }
  },

  spawnActor(data) {
    const { id, x, y, texture } = data;
    if (!this.actors.has(id)) {
      //console.log('spawning actor', { id, x, y, texture });
      const actor = new ClientActor({ scene: this.scene, x, y, texture });
      actor.id = id;
      this.actors.set(id, actor);

      // If this is the player's actor, set it as the player entity and focus the camera
      if (id === this.socket.id) {
        this.scene.controller.playerEntity = actor;
        //this.scene.controller.camera.follow(actor);
      }
    }
  },

  deleteActor(data) {
    const { id } = data;
    if (this.actors.has(id)) {
      const actor = this.actors.get(id);
      actor.prepForDestroy();
      actor.destroy();
      this.actors.delete(id);
    }
  },

  // update(deltaTime) {
  //   for (const actor of this.actors.values()) {
  //     actor.update(deltaTime);
  //   }
  // },

  updateActor(data) {
    const { id, ...updateData } = data;
    if (this.actors.has(id)) {
      const actor = this.actors.get(id);
      if (this.controllerRef.playerEntity != actor) {
        Object.assign(actor, updateData);
        console.log('did');
      } else {        
        console.log('didnt');
      }
    }
  },

  requestSpawnActor(x, y, texture, options, spawnOptions) {
    this.socket.emit('spawnActor', { x, y, texture, options, spawnOptions });
    //console.log('requested server spawn', { x, y, texture, options });
  },

  requestDeleteActor(id) {
    this.socket.emit('deleteActor', { id });
  },
};
