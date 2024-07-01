import { ServerPlayerController } from '../utility/ServerPlayerController.js';
import { ServerActor } from './ServerActor.js';
import { ServerAsteroid } from './ServerAsteroid.js'
import { performance } from 'perf_hooks';
import { log } from '../../shared/Helpers.js';
import { randomUUID } from 'crypto';

// Create a lookup object
const classMap = {
  "ServerActor": ServerActor,
  "ServerAsteroid": ServerAsteroid,
};

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

    const roidData = {
      //id: this.socket.id,
      serverClassType: "ServerAsteroid",
      clientClassType: "ClientAsteroid",
      x: 100,
      y: 100,
      //texture: 'ship', // Adjust as needed
      // options: {
      //   roam: false,
      // },
    };
    
    this.spawnActor(roidData)

    io.on('connection', (socket) => {
      log.info(`Client connected:`, socket.id);

      socket.on('StartController', function(cb) {        
        const playerController = new ServerPlayerController(socket, this);
        ActorManagerServer.playerControllers.set(socket.id, playerController);

        const actorData = {
          //id: this.socket.id,
          serverClassType: "ServerActor",
          clientClassType: "ClientActor",
          x: 0,
          y: 0,
          texture: 'ship', // Adjust as needed
          options: {
            roam: false,
          },
        };
    
        let playerActor = ActorManagerServer.spawnActor(actorData);
        playerActor.setController(playerController);
        playerController.setPlayerActor(playerActor);

        ActorManagerServer.sendWorldToSocket(socket);

        cb(playerActor.id)
      });

      socket.on('applyPlayerUpdate', (data) => {
        this.applyActorUpdateFromClient(data, socket)
      })
      socket.on('spawnActor', this.spawnActor);

      socket.on('disconnect', () => {
        log.info(`Client disconnected: ${socket.id}`);
        if (this.playerControllers.has(socket.id)) {
          this.playerControllers.get(socket.id).destroy();
          //this.playerControllers.delete(socket.id);
        }
      });
    });

    const deltaTime = 0.016 * 1000; // Approximate time between frames (60 FPS)
    setInterval(() => {
      this.update(deltaTime);
}, deltaTime); // 16ms for 60 FPS
    
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

      //if (actor.needsUpdate) this.updateActor(actor);
      if (actor.needsMovementUpdate) {
        this.updateActor(actor, "movement");
        actor.clearUpdates(true);
      }
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
    const spawnOptions = data || {};

    //log.debug('spawn data', spawnOptions);

    //log.debug("spawningActor on manager:", data)

    //const qty = spawnOptions?.qty || 1

      //for (let i = 0; i < qty; i++) {
        const actorId = data.id || randomUUID();

        const actorData = {
          id: actorId,
          clientClassType: data.clientClassType,
          x: data.x,
          y: data.y,
          texture: data.texture,
          options: data.options,
          classData: {},
        };
        let newActor;
        //log.debug("starting new actor")

        const ClassReference = classMap[data.serverClassType];
        if (ClassReference) {
            newActor = new ClassReference(actorData);
        } else {
            throw new Error(`Class ${data.serverClassType} does not exist.`);
        }

        //log.debug("newActor", newActor)

        ActorManagerServer.actors.set(actorId, newActor);
        ActorManagerServer.io.emit('actorSpawned', newActor.getClientSpawnData());

        //spawnedActors.push(newActor);

        //log.info("Spawned new Actor with ID of", log.colorize(actorId, 'blue'))

        return newActor

        //log.debug('actorSpawned', newActor.getClientSpawnData());
      //}
    // } else {
    //   const actorId = data.id || randomUUID();

    //   const actorData = {
    //     id: actorId,
    //     classType: data.classType,
    //     x: data.x,
    //     y: data.y,
    //     texture: data.texture,
    //     options: data.options,
    //   };

    //   const newActor = new ServerActor(actorData);

    //   spawnedActors.push(newActor);
    //   ActorManagerServer.actors.set(actorId, newActor);
    //   ActorManagerServer.io.emit('actorSpawned', actorData);
    // }

    // return spawnedActors;
  },

  sendWorldToSocket(socket) {
    for (const actor of this.actors.values()) {
      let actorSpawnData = actor.getClientSpawnData();
      
      socket.emit('actorSpawned', actor.getClientSpawnData());
    }
  },

  deleteActor(socket, data) {
    const actorId = data.id;
    if (this.actors.has(actorId)) {
      log.debug("Attempting to delete actor id: ", actorId);
      this.actors.delete(actorId);
      this.io.emit('actorDeleted', { id: actorId });
    }
  },

  // Todo: this method needs checks for cheating. way down the road.
  applyActorUpdateFromClient(data, socket) {
    if (ActorManagerServer.playerControllers.has(socket.id)) {
      let socketsPlayerController = ActorManagerServer.playerControllers.get(socket.id);

         
      const actor = socketsPlayerController.actor;
      if (actor.id == data.id) {
        if (data.movement) actor.setMovementUpdateFromClient(data.movement)
      } else {
        // Currently, there is a major issue in MovementComponent that is causing other clients to the server updates it receives as it's own.
        //log.hack(`${socket.id} tried to update actor ${actor.id} but it doesn't have authority!`)   
      }

      //log.debug(socketsPlayerController.actor.MovementComponent.needsUpdate)
    }
  },

  updateActor(actor, updateType = "general") {
    switch (updateType) {
      case "general":
        
        break;
    
      case "movement":
        const updateData = actor.MovementComponent.getAndClearUpdates()
        const socket = actor?.controller?.socket

        // Most actors won't have a socket. If they do, it's likely player controlled, so we need
        // to send it to everyone else, but not the sender.
        // Otherwise, broadcast the actor updates to everyone.
        if (socket) {
          //log.debug("Sent", { id: actor.id, updateData, updateType })
          socket.broadcast.emit('actorUpdated', { id: actor.id, updateData, updateType });
        } else {
          //this.io.emit('actorUpdated', { id: actor.id, updateData, updateType });
        }

        //log.debug("updateData", { id: actor.id, updateData, updateType })
        
        break;
      default:
        break;
    }

    // if (actor) {
    //   const updateData = {
    //     id: actor.id,
    //     x: actor.x,
    //     y: actor.y,
    //     velocity: actor.velocity,
    //     rotation: actor.rotation,
    //     isThrusting: actor.isThrusting,
    //     isBreaking: actor.isBreaking,
    //   };

    //   log.debug("updateData", { updateData })
    //   this.io.emit('actorUpdated', updateData);
    //   actor.needsUpdate = false;
    //   actor.updates = [];
    // }
  },
};
