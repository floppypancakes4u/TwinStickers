import { FlightActorBase, ReplicatedActorBase } from './ReplicatedActorBase.js';
import { log } from '../../shared/helpers.js'

export class ServerActor extends FlightActorBase {
  constructor({
    id,
    x = 0,
    y = 0,
    texture = 'none...oh fuck why is it none?!',
    options = {
      roam: false,
    },
  }) {
    super({id, x, y, options})   

    this.controller = null;

    this.texture = texture; 

    log.debug(`ServerActor Spawned. ID: ${this.id}`)
  }

  setController(controller) {
    this.controller = controller;
  }

  pickNewTarget() {
    const randomOffsetX = Math.random() * 400 - 200;
    const randomOffsetY = Math.random() * 400 - 200;
    const targetX = this.x + randomOffsetX;
    const targetY = this.y + randomOffsetY;

    this.setAutopilotTarget({ x: targetX, y: targetY });

    setTimeout(() => {
      this.pickNewTarget();
    }, 5000);
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);
  }
}
