import { MovementComponent } from "../../shared/MovementComponent.js"
import { log } from '../../shared/helpers.js';

const BRAKING_DISTANCE = 100;

// Basic Actor. Replicated. Has Position. Can have velocity and rotation, but only set once.
// or manually controlled. Meant for static emplacements or static velocites like bullets or comets
export class ReplicatedActorBase {
  constructor({id, x = 0, y = 0}) {
    this.id = id;
    this.x = x;
    this.y = y;    
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;

    this.needsUpdate = false; // Flag for network update
    this.needsMovementUpdate = false;
    this.updates = [];

    this.MovementComponent = new MovementComponent({ actor: this });
    
    log.debug(`ReplicatedActorBase Spawned. ID: ${this.id}`)
  }

  prepForDestroy() {
    this.selected = false;
    this.reticle.clear();
  }

  setRotation(rot) {
    this.rotation = rot;
  }

  update(deltaTime) {    
    this.MovementComponent.update(deltaTime);
    if (this.MovementComponent.needsUpdate) this.needsMovementUpdate = true;
  }
}

// The class has basic flight abilities, including autopilot.
// Weight is added here as it is needed in thrust caculations.
export class FlightActorBase extends ReplicatedActorBase {
  constructor({id, x = 0, y = 0, options = { roam: false }}) {
    super({id, x, y})

    // Flight Properties
    this.weight = {
        base: 1000,
        effective: 1000,
    };

    // Propulsion Propeties
    this.thrust = 5;
    this.brakingThrust = this.thrust / 5;
    this.rotationThrust = 360 // 360 is needed per 1000 effectiveWeight to turn once per second
    this.maxSpeed = 20;

    // Autopilot data
    this.autoPilotActive = false;
    this.autoPilotTarget = {
      target: null,
      x: null,
      y: null,
      shortestDistance: Infinity,
      reachedTarget: false,
    };

    // Flight Control States
    this.inputStates = {
        thrustForward: false,
        braking: false,
        rotateLeft: false,
        rotateRight: false,
        space: false,
      }; 
    
    // Various Spawning Options
    this.spawnOptions = options;

    // Roaming role
    if (this.spawnOptions.roam) this.pickNewTarget();

    log.debug(`FlightActorBase Spawned. ID: ${this.id}`)
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
  
  setThrustForwardState(pressed) {
    this.inputStates.thrustForward = pressed;
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

    const distance = this.MovementComponent.distanceTo({ x: targetX, y: targetY });
    const { targetAngle, rotationDiff } = this.MovementComponent.getRotationDiff(targetX, targetY);

    let facingTarget = false;

    const rotationRatePerFrame = this.MovementComponent.getRotationRate(delta); // get rotation rate per frame

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
        this.setRotation(targetAngle)
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
        && this.MovementComponent.getSpeed() > 0 
        && this.autoPilotTarget.reachedTarget) {
        readyForAutoPilotDisengage = true;
        //log.debug("readyForAutoPilotDisengage set to true", this.MovementComponent.getSpeed())
    }

    if (readyForAutoPilotDisengage && this.MovementComponent.getSpeed() <= 0.25) {
      this.autoPilotActive = false;
      this.setThrustForwardState(false);
      this.brake(false);
      //log.info("Autopilot Deactivated");
    }

    this.autoPilotTarget.previousDistance = distance;
  }

  
  disableAutopilot() {
    this.MovementComponent.disableAutopilot();
  }

  update(deltaTime) {    
    this.MovementComponent.update(deltaTime);
    if (this.MovementComponent.needsUpdate) this.needsMovementUpdate = true;
  }
}
