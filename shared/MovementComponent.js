const ROTATION_STEP = 0.1; // Step size for rotation adjustments
const DECELERATION_THRESHOLD = 50; // Distance threshold for deceleration

export class MovementComponent {
  constructor({ actor }) {
    this.actor = actor;
    this.needsUpdate = false;
  }

  handleShipMovement() {
    this.actor.rotation %= Math.PI * 2;
  
    if (
      this.actor.inputStates.thrustForward &&
      !this.actor.inputStates.braking
    ) {
      this.applyForce(this.actor, this.actor.thrust);
    }
  
    if (this.actor.inputStates.braking) {
      this.applyDeceleration();
      this.setNeedsUpdate();
    }
  
    if (this.actor.inputStates.rotateLeft) {
      this.rotateLeft();
    }
  
    if (this.actor.inputStates.rotateRight) {
      this.rotateRight();
    }
  
    this.limitSpeed();
  
    this.actor.x += this.actor.velocity.x;
    this.actor.y += this.actor.velocity.y;
    this.setNeedsUpdate();
  }

  applyForce(actor, amt, direction = 0) {
    const forceX = Math.cos(actor.rotation + direction);
    const forceY = Math.sin(actor.rotation + direction);

    const acceleration = amt / actor.weight.effective;

    actor.velocity.x += forceX * acceleration;
    actor.velocity.y += forceY * acceleration;

    this.limitSpeed();
    this.setNeedsUpdate();
  }

  // applyForce(amt, effectiveWeight) {
  //   const forceX = Math.cos(this.actor.rotation);
  //   const forceY = Math.sin(this.actor.rotation);

  //   const acceleration = amt / effectiveWeight;

  //   this.actor.velocity.x += forceX * acceleration;
  //   this.actor.velocity.y += forceY * acceleration;

  //   this.limitSpeed();
  //   this.setNeedsUpdate();
  // }

  limitSpeed() {
    const currentSpeed = this.getSpeed();
    if (currentSpeed > this.actor.maxSpeed) {
      const scalingFactor = this.actor.maxSpeed / currentSpeed;
      this.actor.velocity.x *= scalingFactor;
      this.actor.velocity.y *= scalingFactor;
      this.setNeedsUpdate();
    }
  }

  getRotationDiff(x, y) {
    const targetAngle = Math.atan2(y - this.actor.y, x - this.actor.x);
    let rotationDiff = targetAngle - this.actor.rotation;
    rotationDiff = ((rotationDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
    return { targetAngle, rotationDiff };
  }

  rotateLeft() {
    this.actor.rotation -= ROTATION_STEP;
    this.setNeedsUpdate();
  }

  rotateRight() {
    this.actor.rotation += ROTATION_STEP;
    this.setNeedsUpdate();
  }

  applyDeceleration() {
    const decelerationFactor = this.actor.brakingThrust / this.actor.weight.effective;
    const velocityDirection = this.getVelocityRotation();
  
    // Apply force in the opposite direction of the velocity
    const oppositeDirection = velocityDirection + Math.PI;
  
    const forceX = Math.cos(oppositeDirection) * decelerationFactor;
    const forceY = Math.sin(oppositeDirection) * decelerationFactor;
  
    this.actor.velocity.x += forceX;
    this.actor.velocity.y += forceY;
  
    if (Math.abs(this.actor.velocity.x) < 0.01) this.actor.velocity.x = 0;
    if (Math.abs(this.actor.velocity.y) < 0.01) this.actor.velocity.y = 0;
  
    this.setNeedsUpdate();
  }
  

  getVelocityRotation() {
    return Math.atan2(this.actor.velocity.y, this.actor.velocity.x);
  }

  setNeedsUpdate() {
    this.needsUpdate = true;
  }

  getSpeed() {
    return (
      Math.sqrt(this.actor.velocity.x ** 2 + this.actor.velocity.y ** 2) * 23
    );
  }

  distanceTo(otherActor) {
    const dx = this.actor.x - otherActor.x;
    const dy = this.actor.y - otherActor.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  update() {
    this.handleShipMovement();
  }
}
