export class MovementComponent {
    constructor({ actor }) {
        this.actor = actor;
        this.needsUpdate = false;
        this.prevX = actor.pos.x;
        this.prevY = actor.pos.y;
        this.prevRotation = actor.rotation;
        this.prevVelocity = Object.assign({}, actor.velocity);
        this.isApplyingNetworkUpdate = false; // Initialize flag
        this.NextMovementUpdate.id = this.actor.id;
        this.NextMovementUpdate.x = this.actor.pos.x;
        this.NextMovementUpdate.y = this.actor.pos.x;
        this.NextMovementUpdate.rotation = this.actor.rotation;
        this.NextMovementUpdate.velocity = this.actor.velocity;
    }
    applyNetworkMovementUpdate(updateData) {
        if (updateData.id !== this.actor.id)
            return; // Ignore updates not meant for this actor
        this.isApplyingNetworkUpdate = true; // Set flag before applying updates
        Object.assign(this.actor, updateData);
        if (updateData.x !== undefined)
            this.prevX = updateData.x;
        if (updateData.y !== undefined)
            this.prevY = updateData.y;
        if (updateData.rotation !== undefined)
            this.prevRotation = updateData.rotation;
        if (updateData.velocity !== undefined)
            this.prevVelocity = updateData.velocity;
        this.isApplyingNetworkUpdate = false; // Reset flag after applying updates
        this.needsUpdate = false;
    }
    handleShipMovement(delta) {
        this.actor.setRotation(this.actor.rotation %= Math.PI * 2); // This just converts our rotation into phaser 3 rotations
        //this.actor.rotation %= Math.PI * 2;
        let oldX, oldY;
        oldX = this.actor.pos.x;
        oldY = this.actor.pos.y;
        const oldRot = this.actor.rotation;
        if (this.actor.inputStates.thrustForward && !this.actor.inputStates.braking) {
            this.applyForce(this.actor, this.actor.flightData.thrust);
        }
        if (this.actor.inputStates.braking) {
            this.applyDeceleration();
        }
        if (this.actor.inputStates.rotateLeft) {
            this.rotateLeft(delta);
        }
        if (this.actor.inputStates.rotateRight) {
            this.rotateRight(delta);
        }
        this.limitSpeed();
        let newX, newY;
        newX = this.actor.pos.x + this.actor.velocity.x;
        newY = this.actor.pos.y + this.actor.velocity.y;
        this.actor.pos.x = newX;
        this.actor.pos.y = newY;
        this.trackChanges();
    }
    applyForce(actor, amt, direction = 0) {
        const forceX = Math.cos(actor.rotation + direction);
        const forceY = Math.sin(actor.rotation + direction);
        const acceleration = amt / actor.flightData.weight.effective;
        actor.velocity.x += forceX * acceleration;
        actor.velocity.y += forceY * acceleration;
        this.limitSpeed();
    }
    limitSpeed() {
        const currentSpeed = this.getSpeed();
        if (currentSpeed > this.actor.flightData.maxSpeed) {
            const scalingFactor = this.actor.flightData.maxSpeed / currentSpeed;
            this.actor.velocity.x *= scalingFactor;
            this.actor.velocity.y *= scalingFactor;
        }
    }
    getRotationDiff(x, y) {
        const targetAngle = Math.atan2(y - this.actor.pos.y, x - this.actor.pos.x);
        let rotationDiff = targetAngle - this.actor.rotation;
        rotationDiff = ((rotationDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        return { targetAngle, rotationDiff };
    }
    rotateLeft(delta) {
        this.actor.rotation -= this.getRotationRate(delta);
    }
    rotateRight(delta) {
        this.actor.rotation += this.getRotationRate(delta);
    }
    getRotationRate(delta) {
        const force = this.actor.flightData.rotationThrust; // force in pounds
        const weight = this.actor.flightData.weight.effective; // weight in pounds
        // The desired angular velocity for one full rotation per second is 2 * Math.PI radians per second
        const desiredRotationPerSecond = 2 * Math.PI; // full rotation in radians per second
        // Calculate the proportional rotation rate
        // If 320 pounds of force is needed for a 1000-pound object to rotate once per second,
        // we can find the proportional rotation rate by considering the ratio of the given force to 320 pounds,
        // and the given weight to 1000 pounds.
        const baseWeight = 1000; // reference weight
        const baseForce = 360; // reference force
        // Scale the desired rotation rate by the ratio of force to weight
        const scaledForce = force / baseForce; // how much the force differs from the reference
        const scaledWeight = weight / baseWeight; // how much the weight differs from the reference
        // Calculate the rotation rate considering both force and weight scaling
        const rotationRatePerSecond = (scaledForce / scaledWeight) * desiredRotationPerSecond; // radians per second
        // Convert to per frame rate
        const rotationRatePerFrame = rotationRatePerSecond * (delta / 1000); // radians per frame
        return rotationRatePerFrame;
    }
    getFullSpeedData() {
        const thrust = this.actor.flightData.thrust; // force in pounds
        const weight = this.actor.flightData.weight.effective; // weight in pounds
        const maxSpeed = this.actor.flightData.maxSpeed; // max speed in whatever units you're using
        const currentSpeed = this.getSpeed(); // current speed in whatever units you're using
        // Calculate remaining acceleration needed to reach max speed
        const remainingAcceleration = (maxSpeed - currentSpeed) / (thrust / weight); // seconds
        // Distance to reach max speed (current velocity * time + 0.5 * acceleration * time^2)
        const distanceToMaxSpeed = currentSpeed * remainingAcceleration + 0.5 * (thrust / weight) * Math.pow(remainingAcceleration, 2); // units
        // Calculate coordinates for full speed
        const angle = this.getVelocityRotation(); // assuming the thrust direction is aligned with current velocity
        const fullSpeedX = this.actor.pos.x + Math.cos(angle) * distanceToMaxSpeed;
        const fullSpeedY = this.actor.pos.y + Math.sin(angle) * distanceToMaxSpeed;
        return { remainingAcceleration, distanceToMaxSpeed, fullSpeedX, fullSpeedY };
    }
    getStopData() {
        const brakingThrust = this.actor.flightData.brakingThrust; // braking force in pounds
        const weight = this.actor.flightData.weight.effective; // weight in pounds
        const currentSpeed = this.getSpeed(); // current speed in whatever units you're using
        // Calculate deceleration (braking thrust / weight)
        const deceleration = brakingThrust / weight; // units per second squared
        // Time to stop (initial speed / deceleration)
        const timeToStop = currentSpeed / deceleration; // seconds
        // Distance to stop (0.5 * initial speed * time)
        const distanceToStop = 0.5 * currentSpeed * timeToStop; // units
        // Calculate coordinates for stopping
        const angle = this.getVelocityRotation(); // direction of the current velocity
        const stopX = this.actor.pos.x + Math.cos(angle) * distanceToStop;
        const stopY = this.actor.pos.y + Math.sin(angle) * distanceToStop;
        return { timeToStop, distanceToStop, stopX, stopY };
    }
    applyDeceleration() {
        const decelerationFactor = this.actor.flightData.brakingThrust / this.actor.flightData.weight.effective;
        const velocityDirection = this.getVelocityRotation();
        const startVelX = this.actor.velocity.x;
        const startVelY = this.actor.velocity.y;
        if (startVelX === 0 && startVelY === 0)
            return;
        // Apply force in the opposite direction of the velocity
        const oppositeDirection = velocityDirection + Math.PI;
        const forceX = Math.cos(oppositeDirection) * decelerationFactor;
        const forceY = Math.sin(oppositeDirection) * decelerationFactor;
        this.actor.velocity.x += forceX;
        this.actor.velocity.y += forceY;
        if (Math.abs(this.actor.velocity.x) < 0.01)
            this.actor.velocity.x = 0;
        if (Math.abs(this.actor.velocity.y) < 0.01)
            this.actor.velocity.y = 0;
    }
    getVelocityRotation() {
        return Math.atan2(this.actor.velocity.y, this.actor.velocity.x);
    }
    trackChanges() {
        if (this.isApplyingNetworkUpdate)
            return;
        if (this.prevX !== this.actor.pos.x) {
            this.needsUpdate = true;
            this.NextMovementUpdate.x = this.actor.pos.x;
        }
        if (this.prevY !== this.actor.pos.y) {
            this.needsUpdate = true;
            this.NextMovementUpdate.x = this.actor.pos.y;
        }
        if (this.prevRotation !== this.actor.rotation) {
            this.needsUpdate = true;
            this.NextMovementUpdate.rotation = this.actor.rotation;
        }
        if (this.prevVelocity.x !== this.actor.velocity.x || this.prevVelocity.y !== this.actor.velocity.y) {
            this.needsUpdate = true;
            this.NextMovementUpdate.velocity = { x: this.actor.velocity.x, y: this.actor.velocity.y };
        }
        this.prevX = this.actor.pos.x;
        this.prevY = this.actor.pos.y;
        this.prevRotation = this.actor.rotation;
        this.prevVelocity = Object.assign({}, this.actor.velocity);
    }
    // addNetworkUpdate(key: string, value: any) {
    //   // log.info("addNetworkUpdate", k, v)
    //   if (!this.isApplyingNetworkUpdate) { // Check if network update is in progress
    //     this.updates[key] = value;
    //     this.needsUpdate = true;
    //   }
    // }
    getAndClearUpdates() {
        const update = this.NextMovementUpdate;
        this.NextMovementUpdate.id = this.actor.id;
        this.NextMovementUpdate.x = this.actor.pos.x;
        this.NextMovementUpdate.y = this.actor.pos.x;
        this.NextMovementUpdate.rotation = this.actor.rotation;
        this.NextMovementUpdate.velocity = this.actor.velocity;
        this.needsUpdate = false;
        return update;
    }
    getSpeed() {
        return (Math.sqrt(Math.pow(this.actor.velocity.x, 2) + Math.pow(this.actor.velocity.y, 2)) * 23);
    }
    distanceTo(otherActor) {
        const dx = this.actor.pos.x - otherActor.pos.x;
        const dy = this.actor.pos.y - otherActor.pos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    update(delta) {
        this.handleShipMovement(delta);
    }
}
//# sourceMappingURL=MovementComonent.js.map