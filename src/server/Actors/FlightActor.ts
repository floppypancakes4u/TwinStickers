import { MovementActor, MovementActorConstructor } from './MovementActor';
import { MovementComponent } from "../../shared/MovementComonent";

interface FlightActorConstructor extends MovementActorConstructor {
    additionalProperty: string;
}

interface inputStates {
    thrustForward: false,
    braking: false,
    rotateLeft: false,
    rotateRight: false,
    space: false,
}

interface flightData {
    thrust: number;
    brakingThrust: number;
    rotationThrust: number;
    maxSpeed: number;
    weight: {
        base: 1000,
        effective: 1000
    }
}

export class FlightActor extends MovementActor {
    private needsMovementUpdate: boolean;
    private movementComponent: MovementComponent;
    public inputStates: inputStates;
    public flightData: flightData;

    constructor({ id, pos, parentActor }: FlightActorConstructor) {
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
        }
    }

    public setMovementUpdateFromClient(data) {    
        Object.assign(this, data);
    }  

    public update(deltaTime: number) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
