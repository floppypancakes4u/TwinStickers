import { log } from '../shared/helpers.js';
import { ClientActor } from '../classes/ClientActor.js';
import { ClientAsteroid } from '../classes/ClientAsteroid.js';

// Create a lookup object
const classMap = {
  "ClientActor": ClientActor,
  "ClientAsteroid": ClientAsteroid,
};

var roids = [];

export const ActorManagerClient = {
  socket: null,
  scene: null,
  actors: new Map(),
  controllerRef: null,

  init(scene) {
    console.log('Init ActorManagerClient');
    this.socket = scene.socket;
    this.scene = scene;

    this.socket.on('actorSpawned', (data) => {
      this.spawnActor(data);
    });

    this.socket.on('actorDeleted', (data) => {
      this.deleteActor(data);
    });

    this.socket.on('actorUpdated', (data) => {
      this.updateActor(data);
    });
       
    ActorManagerClient.createAsteroidField(scene, 100, 100, 600, 400, 50);
  },

  createAsteroidField(scene, x, y, width, height, count) {
    for (let i = 0; i < count; i++) {
        const asteroidX = Phaser.Math.Between(x, x + width);
        const asteroidY = Phaser.Math.Between(y, y + height);
        const asteroid = new ClientAsteroid({scene, x: asteroidX, y: asteroidY});
        roids.push(asteroid);
    }
  },

  setController(controller) {
    this.controllerRef = controller;
  },

  
  setHoveredEntity(actor) {
    log.debug(1)
    if (this.controllerRef) {
      log.debug(2)
      this.controllerRef.setHoveredEntity(actor)
      log.debug(3)
    }
  },

  getActorByID(id) {
    if (this.actors.has(id)) {
      return this.actors.get(id);
    }
  },

  spawnActor(data) {
    const { id, x, y, velocity, rotation, className, classData } = data;
    log.debug("SpawnActor data:", { id, x, y, velocity, rotation, className, classData })
    if (!this.actors.has(id)) {
      let actor = null;        //log.debug("starting new actor")

      const ClassReference = classMap[className];
      if (ClassReference) {
        actor = new ClassReference({scene: this.scene, x, y, velocity, rotation, className, classData});
      } else {
        throw new Error(`Class ${className} does not exist.`);
      }

      actor.id = id;
      this.actors.set(id, actor);

      // If this is the player's actor, set it as the player entity and focus the camera
      if (id === this.socket.id) {
        this.scene.controller.playerEntity = actor;
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
    const { id, updateData, updateType } = data;
    if (this.actors.has(id)) {
      const actor = this.actors.get(id);
      if (this.controllerRef.playerEntity !== actor) {
        if (updateType === "movement") {
          if (updateData.x !== undefined) actor.x = updateData.x;
          if (updateData.y !== undefined) actor.y = updateData.y;
          if (updateData.velocity) {
            if (updateData.velocity.x !== undefined) actor.velocity.x = updateData.velocity.x;
            if (updateData.velocity.y !== undefined) actor.velocity.y = updateData.velocity.y;
          }
          if (updateData.rotation !== undefined) actor.rotation = updateData.rotation;
        } else {
          Object.assign(actor, updateData);
        }
      }
    }
  },  

  requestSpawnActor(x, y, texture, options, spawnOptions) {
    this.socket.emit('spawnActor', { x, y, serverClassType: "ServerActor", clientClassType: "ClientActor", texture, options, spawnOptions });
    //console.log('requested server spawn', { x, y, texture, options });
  },

  requestDeleteActor(id) {
    this.socket.emit('deleteActor', { id });
  },
};
