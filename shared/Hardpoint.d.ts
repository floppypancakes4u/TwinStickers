import { HardpointDataTableEntry } from 'HardpointDataTable';
interface HardpointConstructor {
    id: any;
    parentActor: any;
    x: number;
    y: number;
    classData?: HardpointDataTableEntry;
}
export declare class TSHardPoint {
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
    activate(): void;
}
export {};
//# sourceMappingURL=Hardpoint.d.ts.map