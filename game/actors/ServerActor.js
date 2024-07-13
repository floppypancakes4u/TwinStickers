import { FlightActorBase, ReplicatedActorBase } from './ReplicatedActorBase.js';
import { log } from '../../shared/Helpers.js'

export class ServerActor extends FlightActorBase {
  constructor({
    id,
    x = 0,
    y = 0,
    options = {
      roam: false,
    },
  }) {
    super({id, x, y, options})   

    this.controller = null;
    this.clientClassName = "ClientActor"
    this.classData = {
      texture: 'ship',
    }

    this.hardpoints = new Map({ 1: null, 2: null});

    this.setHardpoint(1, new BeamHardpoint({id: "testBeam", parentActor: this, x: -2, y: -20.5}))
    this.setHardpoint(2, new ProjectileHardpoint({scene, id: "testProjectile", parentActor: this, x: 2, y: 20.5}))    
  }

  setController(controller) {
    this.controller = controller;
  }

  setHardpoint(id, hardpoint) {
    this.hardpoints.set(id, hardpoint);
    log.debug(`Hardpoint ${id} set for actor`, this);
  }

  clearHardpoint(id) {
    this.hardpoints.delete(id);
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);

    for (const [key, hardpoint] of this.hardpoints.entries()) {
      //console.log(key, hardpoint);
      hardpoint.update(deltaTime);
    }
  }
}
