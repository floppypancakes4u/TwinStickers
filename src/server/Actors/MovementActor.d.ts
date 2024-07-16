import { ReplicatedBase, ReplicatedBaseConstructor, Vector2d } from './ReplicatedBase';
export interface MovementActorConstructor extends ReplicatedBaseConstructor {
}
export declare class MovementActor extends ReplicatedBase {
    velocity: Vector2d;
    private _lastVelocity;
    constructor({ id, pos, parentActor }: MovementActorConstructor);
    setMovementUpdateFromClient(data: any): void;
    update(deltaTime: number): void;
}
