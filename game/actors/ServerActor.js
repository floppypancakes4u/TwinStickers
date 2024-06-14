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

  update(deltaTime) {
    super.update(deltaTime);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);
  }
}
