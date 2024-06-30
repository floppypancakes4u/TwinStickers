export interface DamagerOffset {
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
export interface HardpointData {
    [key: string]: HardpointDataTableEntry;
}
export declare const HardpointDataTable: HardpointData;
//# sourceMappingURL=HardpointDataTable.d.ts.map