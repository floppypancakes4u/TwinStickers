import { ReplicatedBase, ReplicatedBaseConstructor } from './ReplicatedBase';
interface MovementActorConstructor extends ReplicatedBaseConstructor {
    additionalProperty: string;
}
export declare class MovementActor extends ReplicatedBase {
    private needsMovementUpdate;
    private movementComponent;
    constructor({ id, pos, parentActor }: MovementActorConstructor);
    update(deltaTime: number): void;
}
export {};
