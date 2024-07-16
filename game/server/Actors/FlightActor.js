import { MovementActor } from './MovementActor';
import { MovementComponent } from "../../shared/MovementComonent";
export class FlightActor extends MovementActor {
    constructor({ id, pos, parentActor }) {
        super({ id, pos, parentActor });
        this.needsMovementUpdate = false;
        this.movementComponent = new MovementComponent({ actor: this });
        this.inputStates = {
            thrustForward: false,
            braking: false,
            rotateLeft: false,
            rotateRight: false,
            space: false,
        };
        this.flightData = {
            thrust: 5,
            brakingThrust: 1,
            rotationThrust: 360, // 360 is needed per 1000 effectiveWeight to turn once per second
            maxSpeed: 100,
            weight: {
                base: 1000,
                effective: 1000
            }
        };
    }
    update(deltaTime) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
//# sourceMappingURL=FlightActor.js.map