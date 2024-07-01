import { FlightBaseActor } from './BaseActor.js'
import { MovementComponent } from '../shared/MovementComponent.js';
import { InteractionComponent } from './InteractionComponent.js';
import { Engine } from './Engine.js';
import { BeamHardpoint, ProjectileHardpoint } from './ClientHardpoint.js';
import { log } from '../shared/Helpers.js'

const BRAKING_DISTANCE = 100;

export class ClientActor extends FlightBaseActor {
  constructor({ scene, x, y, velocity, rotation, className, classData } = {}) {
    super({scene, x, y});
    // Create the main sprite and add it to the container
    this.sprite = scene.add.sprite(0, 0, classData.texture);
    this.add(this.sprite);

    this.refreshSize();

    this.controller = null;

    this.engines = [
      new Engine({ scene, actor: this, x: -22, y: -6.5 }),
      new Engine({ scene, actor: this, x: -22, y: 6.5 }),
    ];

    this.hardpoints = new Map();

    this.hardpoints.set("test", new BeamHardpoint({scene, id: "test", parentActor: this, x: -2, y: -20.5}))
    this.hardpoints.set("test2", new ProjectileHardpoint({scene, id: "test2", parentActor: this, x: 2, y: 20.5}))

    //log.debug("ClientActor Created")
  }

  setController(controller) {
    this.controller = controller;
  }

  setSelectedHardpointsTarget(actor) {
    for (const [key, hardpoint] of this.hardpoints.entries()) {
      //console.log(key, hardpoint);
      hardpoint.setTarget(actor);
    }
  }

  drawDots() {
    return;
    this.graphics.clear(); // Clear previous drawings

    // Get full speed data
    const { fullSpeedX, fullSpeedY } = this.movementComponent.getFullSpeedData();

    // Get stop data
    const { stopX, stopY } = this.movementComponent.getStopData();

    // Draw green dot for full speed
    this.graphics.fillStyle(0x00ff00, 1.0); // Green color
    this.graphics.fillCircle(fullSpeedX, fullSpeedY, 5); // Draw a circle with radius 5

    // Draw red dot for full stop
    this.graphics.fillStyle(0xff0000, 1.0); // Red color
    this.graphics.fillCircle(stopX, stopY, 5); // Draw a circle with radius 5
}

  preDestroy() {
    this.InteractionComponent.destroy();
  }  

  setVisiblity(state) {
    this.setVisible(state);

    this.engines.forEach((engine) => {
      engine.setVisibility(state);
    });
  }

  update(deltaTime) {
    super.update(deltaTime);
   
    this.engines.forEach((engine) => {
      engine.update();
    });

    for (const [key, hardpoint] of this.hardpoints.entries()) {
      //console.log(key, hardpoint);
      hardpoint.update(deltaTime);
    }
  }
}
