import {MovementComponent} from '../shared/MovementComponent.js';
import {InteractionComponent} from './InteractionComponent.js';
import {log} from '../shared/helpers.js'
import { ActorManagerClient } from '../utility/ActorManagerClient.js';

export class BaseActor extends Phaser.GameObjects.Container {
    constructor({ scene, x, y} = {}) {
        super(scene, x, y);
        this.scene = scene;
        scene.add.existing(this);
        this.velocity = {
            x: 0,
            y: 0
        };

        this.scene.physics.world.enable(this);

        // Create the main sprite and add it to the container
        // this.sprite = scene.add.sprite(0, 0, classData.texture);
        // this.add(this.sprite);

        this.body.setCollideWorldBounds(false);

        this.needsUpdate = false;
        this.needsMovementUpdate = false;
        this.updates = [];
		this.movementUpdates = {}

        this.movementComponent = new MovementComponent({
            actor: this
        });
        this.InteractionComponent = new InteractionComponent({
            actor: this
        })

        //log.debug("BaseActor spawned")
    }

    refreshSize() {
        let {
            x,
            y,
            width,
            height
        } = this.getBounds()
        this.setSize(width, height);

        this.setInteractive();
    }

    delete() {
        this.InteractionComponent.delete();
        this.destroy();
    }

    setVisiblity(state) {
        this.setVisible(state);

        this.each((child) => {
            child.setVisible(state);
        });
    }

    update(deltaTime) {
        this.InteractionComponent.update(deltaTime);
        this.movementComponent.update(deltaTime);

		if (this.movementComponent.needsUpdate) {
			this.movementUpdates = this.movementComponent.getAndClearUpdates();
			//log.info("Movement update", this.movementUpdates)

			ActorManagerClient.sendUpdate({movement: this.movementUpdates})
		}
    }
}

export class FlightBaseActor extends BaseActor {
    constructor({ scene, x, y} = {}) {
        super({scene, x, y});

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
        
        //log.debug("FlightBaseActor spawned")
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

	disableAutopilot() {
	  this.movementComponent.disableAutopilot();
	}

	update(deltaTime) {
	  super.update(deltaTime);
	  if (this.autoPilotActive) this.handleAutopilot(deltaTime);
	}
}