import { HardpointDataTableEntry } from '../HardpointDataTable';
interface HardpointConstructor {
    id: any;
    parentActor: any;
    x: number;
    y: number;
    classData?: HardpointDataTableEntry;
}
export declare class HardPoint {
    private id;
    private parentActor;
    private targetActor;
    private x;
    private y;
    private offsetX;
    private offsetY;
    private classData;
    private damageSpawnPoints;
    private currentDamageSpawnerIndex;
    private timeSinceLastShot;
    private distance;
    private baseRotation;
    private localRotation;
    private firingAngle;
    private active;
    constructor({ id, parentActor, x, y, classData }: HardpointConstructor);
    private setRotation;
    private handleHardpointLocalRotation;
    private IncrementSpawnerIndex;
    private isFacingTarget;
    private getProjectileSpawnPosition;
    private update;
    activate(): void;
    deactivate(): void;
    setTarget(actor: any): void;
    fire(): void;
}
export {};
