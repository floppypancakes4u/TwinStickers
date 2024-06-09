import { MovementComponent } from '../../shared/MovementComponent.js';

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
    this.rotation = 0; // Rotation in degrees
    this.velocity = { x: 0, y: 0 };

    this.weight = {
      base: 10000,
      effective: 10000,
    };
    this.thrust = 200;
    this.brakingThrust = this.thrust / 5;
    this.maxSpeed = 100;

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

    // Move this to an AI controller eventually
    this.autopilot = false;
    this.targetActor = null;
    this.navigationTargetPos = { x: 0, y: 0 };
    this.targetX = x; // Initial target location
    this.targetY = y;
    this.spawnOptions = options;

    this.needsUpdate = false; // Flag for network update
    this.updates = [];

    this.movementComponent = new MovementComponent({ actor: this });

    if (this.spawnOptions.roam) this.pickNewTarget();
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

  brake(pressed) {
    this.inputStates.brake = pressed;
  }

  rotateLeft(pressed) {
    this.inputStates.rotateLeft = pressed;
  }

  rotateRight(pressed) {
    this.inputStates.rotateRight = pressed;
  }

  setAutopilotTarget({ target, x = null, y = null }) {
    this.movementComponent.setAutopilotTarget({ target, x, y });
  }

  // setAutopilotTarget({ target, x = null, y = null }) {
  //   if (target instanceof ServerActor) {
  //     this.targetActor = target;
  //     this.autopilot = true;
  //     this.navigationTargetPos = { x: 0, y: 0 };
  //   } else if (x !== null && y !== null) {
  //     this.navigationTargetPos = { x, y };
  //     this.autopilot = true;
  //     this.targetActor = null;
  //   }
  // }

  disableAutopilot() {
    this.movementComponent.disableAutopilot();
  }

  update(deltaTime) {
    // if (this.autopilot) {
    //   const distance = this.movementComponent.distanceTo({
    //     x: this.navigationTargetPos.x,
    //     y: this.navigationTargetPos.y,
    //   });

    //   let turningResult = this.movementComponent.turnTowardsTarget({
    //     x: this.navigationTargetPos.x,
    //     y: this.navigationTargetPos.y,
    //     distance,
    //   });

    //   const { shouldThrust, shouldBrake } =
    //     this.movementComponent.handleAccelerationToTarget({
    //       x: this.navigationTargetPos.x,
    //       y: this.navigationTargetPos.y,
    //       distance,
    //     });

    //   if (shouldThrust) {
    //     this.thrustForward(true);
    //   }

    //   if (shouldBrake) {
    //     this.applyDeceleration();
    //   }

    //   if (turningResult.needsUpdate) {
    //     this.updates.push({ rotation: this.rotation });
    //     this.setNeedsUpdate();
    //   }
    // }

    this.movementComponent.update();
  }

  setNeedsUpdate() {
    this.needsUpdate = true;
  }

  destroy() {
    // Add cleanup code here if needed
  }
}
