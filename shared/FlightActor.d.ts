import { MovementActor, MovementActorConstructor } from '../server/Actors/MovementActor';
interface FlightActorConstructor extends MovementActorConstructor {
    additionalProperty: string;
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
    setMovementUpdateFromClient(data: any): void;
    update(deltaTime: number): void;
}
export {};
