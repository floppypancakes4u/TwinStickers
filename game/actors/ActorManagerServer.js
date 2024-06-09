import { ServerPlayerController } from '../utility/ServerPlayerController.js';
import { ServerActor } from './ServerActor.js';
import { performance } from 'perf_hooks';
import crypto, { randomUUID } from 'crypto';

export const ActorManagerServer = {
  io: null,
  actors: new Map(),
  playerControllers: new Map(),
  performanceMeasurements: {
    enabled: true,
    totalTime: 0,
    frameCount: 0,
  },

  init(io) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      const playerController = new ServerPlayerController(socket, this);
      this.playerControllers.set(socket.id, playerController);

      socket.on('spawnActor', this.spawnActor);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (this.playerControllers.has(socket.id)) {
          this.playerControllers.get(socket.id).destroy();
          this.playerControllers.delete(socket.id);
        }
      });
    });

    const deltaTime = 0.016; // Approximate time between frames (60 FPS)
    setInterval(() => {
      this.update(deltaTime);
    }, deltaTime * 1000); // 16ms for 60 FPS

    // Log performance every second
    setInterval(() => {
      if (
        this.performanceMeasurements.enabled &&
        this.performanceMeasurements.frameCount > 0
      ) {
        const averageTime =
          this.performanceMeasurements.totalTime /
          this.performanceMeasurements.frameCount;
        const averageFPS = 1000 / averageTime;
        // console.log(
        //   `Server Average Update Time: ${averageTime.toFixed(
        //     2
        //   )} ms, Average FPS: ${averageFPS.toFixed(2)}, Total Actors: ${
        //     this.actors.size
        //   }`
        // );
        this.performanceMeasurements.totalTime = 0;
        this.performanceMeasurements.frameCount = 0;
      }
    }, 1000);
  },

  update(deltaTime) {
    const startTime = performance.now();

    for (const actor of this.actors.values()) {
      actor.update(deltaTime);

      if (actor.needsUpdate) this.updateActor(actor);
    }

    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    if (this.performanceMeasurements.enabled) {
      this.performanceMeasurements.totalTime += timeTaken;
      this.performanceMeasurements.frameCount += 1;
    }

    // console.log(
    //   `Update Time: ${timeTaken.toFixed(2)} ms, FPS: ${fps.toFixed(2)}`
    // );
  },

  togglePerformanceMeasurements(enabled) {
    this.performanceMeasurements.enabled = enabled;
  },

  spawnActor(data) {
    let spawnedActors = [];
    const spawnOptions = data.spawnOptions || {};

    //console.log('spawn data', spawnOptions);

    if (spawnOptions?.qty > 0) {
      for (let i = 0; i < spawnOptions.qty; i++) {
        const actorId = data.id || randomUUID();

        const actorData = {
          id: actorId,
          x: data.x,
          y: data.y,
          texture: data.texture,
          options: data.options,
        };
        const newActor = new ServerActor(actorData);

        ActorManagerServer.actors.set(actorId, newActor);
        ActorManagerServer.io.emit('actorSpawned', actorData);

        spawnedActors.push(newActor);

        //console.log('spawning', actorData);
      }
    } else {
      const actorId = data.id || randomUUID();

      const actorData = {
        id: actorId,
        x: data.x,
        y: data.y,
        texture: data.texture,
        options: data.options,
      };

      const newActor = new ServerActor(actorData);

      spawnedActors.push(newActor);
      ActorManagerServer.actors.set(actorId, newActor);
      ActorManagerServer.io.emit('actorSpawned', actorData);
    }

    return spawnedActors;
  },

  deleteActor(socket, data) {
    const actorId = data.id;
    if (this.actors.has(actorId)) {
      this.actors.delete(actorId);
      this.io.emit('actorDeleted', { id: actorId });
    }
  },

  updateActor(actor) {
    if (actor) {
      const updateData = {
        id: actor.id,
        x: actor.x,
        y: actor.y,
        velocity: actor.velocity,
        rotation: actor.rotation,
        isThrusting: actor.isThrusting,
        isBreaking: actor.isBreaking,
      };

      //console.log("updateData", { updateData })
      this.io.emit('actorUpdated', updateData);
      actor.needsUpdate = false;
      actor.updates = [];
    }
  },
};
