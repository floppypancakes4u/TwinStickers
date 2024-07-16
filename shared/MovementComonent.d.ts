import { FlightActor } from "../server/Actors/FlightActor";
import { Vector2d } from "../../shared/Helpers";
interface UpdateData {
    id: string;
    x?: number;
    y?: number;
    rotation?: number;
    velocity?: Vector2d;
}
interface FullSpeedData {
    remainingAcceleration: number;
    distanceToMaxSpeed: number;
    fullSpeedX: number;
    fullSpeedY: number;
}
interface StopData {
    timeToStop: number;
    distanceToStop: number;
    stopX: number;
    stopY: number;
}
export declare class MovementComponent {
    private actor;
    private needsUpdate;
    private updates;
    private prevX;
    private prevY;
    private prevRotation;
    private prevVelocity;
    private isApplyingNetworkUpdate;
    constructor({ actor }: {
        actor: FlightActor;
    });
    applyNetworkMovementUpdate(updateData: UpdateData): void;
    handleShipMovement(delta: number): void;
    applyForce(actor: FlightActor, amt: number, direction?: number): void;
    limitSpeed(): void;
    getRotationDiff(x: number, y: number): {
        targetAngle: number;
        rotationDiff: number;
    };
    rotateLeft(delta: number): void;
    rotateRight(delta: number): void;
    getRotationRate(delta: number): number;
    getFullSpeedData(): FullSpeedData;
    getStopData(): StopData;
    applyDeceleration(): void;
    getVelocityRotation(): number;
    trackChanges(): void;
    addNetworkUpdate(key: string, value: any): void;
    getAndClearUpdates(): Partial<UpdateData>;
    getSpeed(): number;
    distanceTo(otherActor: FlightActor): number;
    update(delta: number): void;
}
export {};
