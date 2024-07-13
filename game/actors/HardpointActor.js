import { ReplicatedActorBase } from './ReplicatedActorBase.js';
import { log } from '../../shared/Helpers.js'

export class HardpointActor extends ReplicatedActorBase {
  constructor({
    id,
    x = 0,
    y = 0,
    parentActor,
    classData
  }) {
    super({id, x, y, options})   

    this.parentActor = parentActor;
    this.classData = classData;
  }

  setController(controller) {
    this.controller = controller;
  }
  
  getClientSpawnData() {
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        rotation: this.rotation,
        velocity: this.velocity,
        classData: this.classData
    }
}

  update(deltaTime) {
    super.update(deltaTime);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);
  }
}
