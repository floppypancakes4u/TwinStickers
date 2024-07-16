import { ReplicatedBase, ReplicatedBaseConstructor } from '../server/Actors/ReplicatedBase';
import { Vector2d } from "./Helpers";
export interface MovementActorConstructor extends ReplicatedBaseConstructor {
}
export declare class MovementActor extends ReplicatedBase {
    velocity: Vector2d;
    private _lastVelocity;
    constructor({ id, pos, parentActor }: MovementActorConstructor);
    setMovementUpdateFromClient(data: any): void;
    update(deltaTime: number): void;
}
