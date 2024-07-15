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
    classData = {
      texture: 'ship',
      hardpointMounts: {
        1: {x: -2, y: -20.5, actor: null},
        2: {x: 2, y: 20.5, actor: null},
      }
    }
  }) {
    super({id, x, y, options})   

    this.controller = null;
    this.clientClassName = "ClientActor"
    this._classData = classData;

    this.hardpoints = new Map();

    // console.log("this._classData", this._classData)
    // // Setup hardpoints
    // this._classData.hardpointMounts.forEach((mount, index) => {
    //   this.hardpoints.set(index, mount);
    // });


    // this.setHardpoint(1, new BeamHardpoint({id: "testBeam", parentActor: this}))
    // this.setHardpoint(2, new ProjectileHardpoint({scene, id: "testProjectile", parentActor: this}))    
  }

  setController(controller) {
    this.controller = controller;
  }

  setHardpoint(id, hardpoint) {
    this.hardpoints.get(id).actor = hardpoint;
    //this.hardpoints.set(id, hardpoint);
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
