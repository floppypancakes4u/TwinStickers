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
    private worldX;
    private worldY;
    private offsetX;
    private offsetY;
    private classData;
    private damageSpawnPoints;
    private currentDamageSpawnerIndex;
    private rotationSpeed;
    private damagePerHit;
    private rateOfFire;
    private timeSinceLastShot;
    private distance;
    private baseRotation;
    private localRotation;
    private firingAngle;
    private drawFiringAngles;
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
interface DamagerOffset {
    x: number;
    y: number;
}
export interface HardpointDataTableEntry {
    type: string;
    rotationSpeed: number;
    texture: string;
    damageSpawnerOffsets: DamagerOffset[];
    alternateOffsets: boolean;
}
interface HardpointData {
    [key: string]: HardpointDataTableEntry;
}
export declare const HardpointDataTable: HardpointData;
export {};
