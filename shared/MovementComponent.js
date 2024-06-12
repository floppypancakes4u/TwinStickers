import { log } from "./helpers.js";

const ROTATION_STEP = 0.1; // Step size for rotation adjustments
const DECELERATION_THRESHOLD = 50; // Distance threshold for deceleration

const POUND_FORCE_PER_REVOLUTION = 320;

export class MovementComponent {
  constructor({ actor }) {
    this.actor = actor;
    this.needsUpdate = false;
  }

  handleShipMovement(delta) {
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
      this.rotateLeft(delta);
    }
  
    if (this.actor.inputStates.rotateRight) {
      this.rotateRight(delta);
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

  rotateLeft(delta) {
    //this.actor.rotation -= .5;
    
    this.actor.rotation -= this.getRotationRate(delta);
    this.setNeedsUpdate();
  }

  rotateRight(delta) {
    this.actor.rotation += this.getRotationRate(delta);

    this.setNeedsUpdate();
  }

  getRotationRate(delta) {
    var force = this.actor.rotationThrust; // force in pounds
    var weight = this.actor.weight.effective; // weight in pounds

    // The desired angular velocity for one full rotation per second is 2 * Math.PI radians per second
    var desiredRotationPerSecond = 2 * Math.PI; // full rotation in radians per second

    // Calculate the proportional rotation rate
    // If 320 pounds of force is needed for a 1000-pound object to rotate once per second,
    // we can find the proportional rotation rate by considering the ratio of the given force to 320 pounds,
    // and the given weight to 1000 pounds.
    var baseWeight = 1000; // reference weight
    var baseForce = 360; // reference force

    // Scale the desired rotation rate by the ratio of force to weight
    var scaledForce = force / baseForce; // how much the force differs from the reference
    var scaledWeight = weight / baseWeight; // how much the weight differs from the reference

    // Calculate the rotation rate considering both force and weight scaling
    const rotationRatePerSecond = (scaledForce / scaledWeight) * desiredRotationPerSecond; // radians per second

    // Convert to per frame rate
    const rotationRatePerFrame = rotationRatePerSecond * (delta / 1000); // radians per frame

    return rotationRatePerFrame;
  }

  getFullSpeedData() {
    const thrust = this.actor.thrust; // force in pounds
    const weight = this.actor.weight.effective; // weight in pounds
    const maxSpeed = this.actor.maxSpeed; // max speed in whatever units you're using
    const currentSpeed = this.getSpeed(); // current speed in whatever units you're using

    // Calculate remaining acceleration needed to reach max speed
    const remainingAcceleration = (maxSpeed - currentSpeed) / (thrust / weight); // seconds

    // Distance to reach max speed (current velocity * time + 0.5 * acceleration * time^2)
    const distanceToMaxSpeed = currentSpeed * remainingAcceleration + 0.5 * (thrust / weight) * Math.pow(remainingAcceleration, 2); // units

    // Calculate coordinates for full speed
    const angle = this.getVelocityRotation(); // assuming the thrust direction is aligned with current velocity
    const fullSpeedX = this.actor.x + Math.cos(angle) * distanceToMaxSpeed;
    const fullSpeedY = this.actor.y + Math.sin(angle) * distanceToMaxSpeed;

    return { remainingAcceleration, distanceToMaxSpeed, fullSpeedX, fullSpeedY };
}

  getStopData() {
    const brakingThrust = this.actor.brakingThrust; // braking force in pounds
    const weight = this.actor.weight.effective; // weight in pounds
    const currentSpeed = this.getSpeed(); // current speed in whatever units you're using

    // Calculate deceleration (braking thrust / weight)
    const deceleration = brakingThrust / weight; // units per second squared

    // Time to stop (initial speed / deceleration)
    const timeToStop = currentSpeed / deceleration; // seconds

    // Distance to stop (0.5 * initial speed * time)
    const distanceToStop = 0.5 * currentSpeed * timeToStop; // units

    // Calculate coordinates for stopping
    const angle = this.getVelocityRotation(); // direction of the current velocity
    const stopX = this.actor.x + Math.cos(angle) * distanceToStop;
    const stopY = this.actor.y + Math.sin(angle) * distanceToStop;

    return { timeToStop, distanceToStop, stopX, stopY };
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

  update(delta) {
    this.handleShipMovement(delta);
  }
}
