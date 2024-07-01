interface DamagerOffset {
    x: number;
    y: number;
}
export interface HardpointDataTableEntry {
    type: string;
    rotationSpeed: number;
    texture: string;
    rateOfFire: number;
    damagePerHit: number;
    damageSpawnerOffsets: DamagerOffset[];
    alternateOffsets: boolean;
}
interface HardpointData {
    [key: string]: HardpointDataTableEntry;
}
export declare const HardpointDataTable: HardpointData;
export {};
