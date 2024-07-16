// import { MathHelper } from "./MathHelper";
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

export class ReplicatedBase {
    public id: string;
    public pos: Vector2d;
    private _lastPos: Vector2d;
    public rotation: number;
    private _lastRotation: number;
    private parentActor: ReplicatedBase | undefined;
    private needsUpdate: boolean;
    private classData: ClassData;
    private created: Date;

    constructor({ id, pos, parentActor = undefined }: ReplicatedBaseConstructor) {
        this.id = id;
        this.pos = pos;
        this._lastPos = pos;
        this.rotation = 0;
        this._lastRotation = 0;
        this.parentActor = parentActor;
        this.needsUpdate = false;
        this.classData = {};
        this.created = new Date();
    }

    private requireUpdate() {
        this.needsUpdate = true;
    }

    // private clearUpdates() {
    //     this.needsUpdate = false;
    // }

    public getUpdates(forceAll: boolean = false): MovementUpdate {
        let updates: MovementUpdate = {};

        if (this._lastPos != this.pos || forceAll) {
            updates.pos = this.pos;
            this._lastPos = this.pos
        }

        if (this._lastRotation != this.rotation || forceAll) {
            updates.rotation = this.rotation;
            this._lastRotation = this.rotation;
        }

        if (this._lastPos != this.pos || forceAll) {
            updates.pos = this.pos;
            this._lastPos = this.pos
        }

        //this.clearUpdates();

        return updates;
    }

    public getClientSpawnData(): SpawnData {
        return {
            id: this.id,
            parentActor: this.parentActor,
            created: this.created,
            MovementData: this.getUpdates(true),
        };
    }

    public setRotation(rot: number) {
        this.rotation = rot;
        this.requireUpdate();
    }

    public update(deltaTime: number) {

    }
}