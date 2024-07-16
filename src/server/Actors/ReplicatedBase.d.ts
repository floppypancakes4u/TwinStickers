import { Vector2d } from "../../shared/Helpers";
export interface ReplicatedBaseConstructor {
    id: string;
    pos: Vector2d;
    parentActor?: ReplicatedBase;
}
export interface ClassData {
}
interface MovementUpdate {
    pos?: Vector2d;
    velocity?: Vector2d;
    rotation?: number;
    speed?: number;
}
export interface SpawnData {
    id: string;
    parentActor?: ReplicatedBase;
    created?: Date;
    MovementData: MovementUpdate;
}
export declare class ReplicatedBase {
    id: string;
    pos: Vector2d;
    private _lastPos;
    rotation: number;
    private _lastRotation;
    private parentActor;
    private needsUpdate;
    private classData;
    private created;
    constructor({ id, pos, parentActor }: ReplicatedBaseConstructor);
    private requireUpdate;
    getUpdates(forceAll?: boolean): MovementUpdate;
    getClientSpawnData(): SpawnData;
    setRotation(rot: number): void;
    update(deltaTime: number): void;
}
export {};
