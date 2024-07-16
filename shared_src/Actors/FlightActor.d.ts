import { MovementActor, MovementActorConstructor } from './MovementActor';
export interface FlightActorConstructor extends MovementActorConstructor {
}
interface inputStates {
    thrustForward: false;
    braking: false;
    rotateLeft: false;
    rotateRight: false;
    space: false;
}
interface flightData {
    thrust: number;
    brakingThrust: number;
    rotationThrust: number;
    maxSpeed: number;
    weight: {
        base: 1000;
        effective: 1000;
    };
}
export declare class FlightActor extends MovementActor {
    private needsMovementUpdate;
    private movementComponent;
    inputStates: inputStates;
    flightData: flightData;
    constructor({ id, pos, parentActor }: FlightActorConstructor);
    update(deltaTime: number): void;
}
export {};
