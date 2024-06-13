import { MovementComponent } from '../../shared/MovementComponent.js';
import { log } from '../../shared/helpers.js'

const ROTATION_STEP = 0.1; // Step size for rotation adjustments
const STOP_THRESHOLD = 5; // Distance threshold for stopping autopilot
const DECELERATION_THRESHOLD = 50; // Distance threshold for deceleration
const DECELERATION_FACTOR = 0.95; // Factor for deceleration
const FULL_THRUST_FACTOR = 1;
const MAX_SPEED = 50;

export class ServerActor {
  constructor({
    id,
    x = 0,
    y = 0,
    texture = 'none...oh fuck why is it none?!',
    options = {
      roam: false,
    },
  }) {
    this.id = id;

    this.x = x;
    this.y = y;
    
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

    this.movementComponent = new MovementComponent({ actor: this });

    this.texture = texture;
    this.startingPos = { x, y };
    
    this.spawnOptions = options;

    this.needsUpdate = false; // Flag for network update
    this.needsMovementUpdate = false;
    this.updates = [];

    this.movementComponent = new MovementComponent({ actor: this });

    if (this.spawnOptions.roam) this.pickNewTarget();
    
    //log.debug("Created Server Ship Actor options", this.spawnOptions)
  }

  setController(controller) {
    this.controller = controller;
  }

  pickNewTarget() {
    const randomOffsetX = Math.random() * 400 - 200;
    const randomOffsetY = Math.random() * 400 - 200;
    this.targetX = this.x + randomOffsetX;
    this.targetY = this.y + randomOffsetY;

    this.setAutopilotTarget({ x: this.targetX, y: this.targetY });

    setTimeout(() => {
      this.pickNewTarget();
    }, 2000);
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
            //log.debug("rot right")
        } else {
            this.rotateLeft(true);
            //log.debug("rot left")
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
        log.debug("this.autoPilotTarget.reachedTarget to true")
    }

    let readyForAutoPilotDisengage = false;
    if (this.autoPilotTarget.previousDistance !== Infinity 
        && this.movementComponent.getSpeed() > 0 
        && this.autoPilotTarget.reachedTarget) {
        readyForAutoPilotDisengage = true;
        log.debug("readyForAutoPilotDisengage set to true", this.movementComponent.getSpeed())
    }

    if (readyForAutoPilotDisengage && this.movementComponent.getSpeed() <= 0.25) {
      this.autoPilotActive = false;
      this.setThrustForwardState(false);
      this.brake(false);
      log.info("Autopilot Deactivated");
    }

    this.autoPilotTarget.previousDistance = distance;
  }

  
  disableAutopilot() {
    this.movementComponent.disableAutopilot();
  }

  update(deltaTime) {
    //this.movementComponent.updateStates(this.inputStates);
    if (this.autoPilotActive) this.handleAutopilot(deltaTime);
    this.movementComponent.update(deltaTime);

    if (this.movementComponent.needsUpdate) this.needsMovementUpdate = true;

    // this.engines.forEach((engine) => {
    //   engine.update();
    // });
  }
}
