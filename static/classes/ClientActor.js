import { MovementComponent } from '../shared/MovementComponent.js';
import { Engine } from './Engine.js';
import { ActorManagerClient } from '../utility/ActorManagerClient.js';
import { log } from '../shared/helpers.js'

const BRAKING_DISTANCE = 100;

export class ClientActor extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, texture, frame } = {}) {
    super(scene, x, y, texture, frame);

    this.scene = scene;
    scene.add.existing(this);

    this.setInteractive();
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(false);

    this.reticle = this.scene.add.graphics();
    this.graphics = this.scene.add.graphics();

    this.hovered = false;
    this.selected = false;

    this.velocity = { x: 0, y: 0 };
    this.rotation = 0; // Ensure rotation is defined

    this.autoPilotActive = false;
    this.autoPilotTarget = {
      target: null,
      x: null,
      y: null,
      shortestDistance: Infinity,
      reachedTarget: false,
    };

    this.thrust = 5;
    this.brakingThrust = this.thrust / 5;
    this.rotationThrust = 360 // 360 is needed per 1000 effectiveWeight to turn once per second
    this.maxSpeed = 20;
    this.weight = {
      base: 1000,
      effective: 1000,
    };

    this.inputStates = {
      thrustForward: false,
      braking: false,
      rotateLeft: false,
      rotateRight: false,
      space: false,
    };

    this.controller = null;

    this.movementComponent = new MovementComponent({ actor: this });
    this.engines = [
      new Engine({ scene, actor: this, x: -22, y: -6.5 }),
      new Engine({ scene, actor: this, x: -22, y: 6.5 }),
    ];

    this.on('pointerover', () => {
      this.hovered = true;
      ActorManagerClient.setHoveredEntity(this);
    });

    this.on('pointerout', () => {
      this.hovered = false;
      if (!this.selected) {
        this.reticle.clear();
        ActorManagerClient.setHoveredEntity(this);
      }
    });

    //log.debug("Created Client Ship Actor", this)
  }

  setController(controller) {
    this.controller = controller;
  }

  drawReticle(color) {
    const { x, y, width, height } = this.getBounds();
    const cornerSize = 5;

    this.reticle.clear();
    this.reticle.lineStyle(2, color, 1);
    this.reticle.strokeLineShape(new Phaser.Geom.Line(x, y, x + cornerSize, y));
    this.reticle.strokeLineShape(new Phaser.Geom.Line(x, y, x, y + cornerSize));
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x + width, y, x + width - cornerSize, y)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x + width, y, x + width, y + cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x, y + height, x + cornerSize, y + height)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x, y + height, x, y + height - cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        x + width,
        y + height,
        x + width - cornerSize,
        y + height
      )
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        x + width,
        y + height,
        x + width,
        y + height - cornerSize
      )
    );
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

  updateReticle() {
    if (this.hovered && !this.selected) {
      this.drawReticle(0x636262);
      return;
    }

    if (this.selected) {
      this.drawReticle(0xffffff);
    } else {
      this.reticle.clear();
    }
  }

  prepForDestroy() {
    this.selected = false;
    this.reticle.clear();
  }

  setThrustForwardState(pressed) {
    this.inputStates.thrustForward = pressed;

    this.engines.forEach((engine) => {
      engine.SetThrusting(pressed);
    });
  }

  setVisiblity(state) {
    this.setVisible(state);

    this.engines.forEach((engine) => {
      engine.setVisibility(state);
    });
  }

  brake(pressed) {
    this.inputStates.braking = pressed;
  }

  rotateLeft(pressed) {
    this.inputStates.rotateLeft = pressed;
  }

  rotateRight(pressed) {
    this.inputStates.rotateRight = pressed;
  }

  setAutopilotTarget({ target = null, x = null, y = null }) {
    this.autoPilotActive = true;
    this.autoPilotTarget = {
      target,
      x,
      y,
      previousDistance: Infinity,
      reachedTarget: false
    };
  }
 
  handleAutopilot(delta) {
    if (!this.autoPilotActive) return;

    let targetX, targetY;

    if (this.autoPilotTarget.target && this.autoPilotTarget.target instanceof ClientActor) {
        targetX = this.autoPilotTarget.target.x;
        targetY = this.autoPilotTarget.target.y;
    } else if (this.autoPilotTarget.x !== null && this.autoPilotTarget.y !== null) {
        targetX = this.autoPilotTarget.x;
        targetY = this.autoPilotTarget.y;
    } else {
        return;
    }

    const distance = this.movementComponent.distanceTo({ x: targetX, y: targetY });
    const { targetAngle, rotationDiff } = this.movementComponent.getRotationDiff(targetX, targetY);

    let facingTarget = false;

    const rotationRatePerFrame = this.movementComponent.getRotationRate(delta); // get rotation rate per frame

    if (Math.abs(rotationDiff) > rotationRatePerFrame) {
        if (rotationDiff > 0) {
            this.rotateRight(true);
        } else {
            this.rotateLeft(true);
        }
    } else {
        this.rotateRight(false);
        this.rotateLeft(false);
        this.rotation = targetAngle; // Snap to the exact angle when close
        facingTarget = true;
    }

    // Don't thrust if we aren't facing the target
    if (!facingTarget) return;

    if (distance <= BRAKING_DISTANCE) {
        this.setThrustForwardState(false);
        this.brake(true);
    }

    if (distance > BRAKING_DISTANCE) {
        this.setThrustForwardState(true);
        this.brake(false);
    }

    if (distance <= 25) {
        this.autoPilotTarget.reachedTarget = true;
        //log.debug("this.autoPilotTarget.reachedTarget to true")
    }

    let readyForAutoPilotDisengage = false;
    if (this.autoPilotTarget.previousDistance !== Infinity 
        && this.movementComponent.getSpeed() > 0 
        && this.autoPilotTarget.reachedTarget) {
        readyForAutoPilotDisengage = true;
        //log.debug("readyForAutoPilotDisengage set to true", this.movementComponent.getSpeed())
    }

    if (readyForAutoPilotDisengage && this.movementComponent.getSpeed() <= 0.25) {
      this.autoPilotActive = false;
      this.setThrustForwardState(false);
      this.brake(false);
      //log.info("Autopilot Deactivated");
    }

    this.autoPilotTarget.previousDistance = distance;
  } 

  
  // handleAutoPilot() {
  //   let distance = 1000000000000000;
  //   let x = 0;
  //   let y = 0;

  //   if (this.autoPilotTarget.target && this.autoPilotTargettarget instanceof ClientActor) {

  //   }

  //   if (this.autoPilotTarget.x && this.autoPilotTarget.y) {
  //     x = this.autoPilotTarget.x;
  //     y = this.autoPilotTarget.y;

  //     distance = this.movementComponent.distanceTo({x, y})
  //     this.movementComponent.turnTowardsTarget({x, y, distance})
  //   }

  //     const { shouldThrust, shouldBrake } =
  //       this.movementComponent.handleAccelerationToTarget({
  //         x,
  //         y,
  //         distance,
  //       });

  //     this.setThrustForwardState(shouldThrust)
  //     this.brake(shouldBrake)

  //     console.log({ shouldThrust, shouldBrake })
  //     // if (shouldBrake) {
  //     //   this.applyDeceleration();
  //     // }
  // }

  disableAutopilot() {
    this.movementComponent.disableAutopilot();
  }

  update(deltaTime) {
    this.updateReticle();
    //this.movementComponent.updateStates(this.inputStates);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);
    this.movementComponent.update(deltaTime);
    this.drawDots()

    this.engines.forEach((engine) => {
      engine.update();
    });
  }
}
