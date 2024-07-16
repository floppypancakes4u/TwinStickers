import { ReplicatedBase, ReplicatedBaseConstructor, Vector2d } from './ReplicatedBase';
import { MovementUpdate } from "../../shared/MovementComonent";
export interface MovementActorConstructor extends ReplicatedBaseConstructor {
}
export declare class MovementActor extends ReplicatedBase {
    velocity: Vector2d;
    private _lastVelocity;
    constructor({ id, pos, parentActor }: MovementActorConstructor);
    setMovementUpdateFromClient(update: MovementUpdate): void;
    update(deltaTime: number): void;
}
