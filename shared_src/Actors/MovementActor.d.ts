import { ReplicatedBase, ReplicatedBaseConstructor } from './ReplicatedBase';
import { MovementUpdate } from "../MovementComonent";
import { Vector2d } from '../Helpers';
export interface MovementActorConstructor extends ReplicatedBaseConstructor {
}
export declare class MovementActor extends ReplicatedBase {
    velocity: Vector2d;
    private _lastVelocity;
    constructor({ id, pos, parentActor }: MovementActorConstructor);
    setMovementUpdateFromClient(update: MovementUpdate): void;
    update(deltaTime: number): void;
}
