// src/hardpointData.ts

interface DamagerOffset {
  x: number;
  y: number;
}

interface Hardpoint {
  type: string;
  rotationSpeed: number;
  texture: string;
  damageSpawnerOffsets: DamagerOffset[];
  alternateOffsets: boolean;
  useAllOffsetsSimultaneously: boolean;
}

interface HardpointData {
  [key: string]: Hardpoint;
}
  
export const HardpointDataTable: HardpointData = {
    devBlaster: {
      type: "Projectile",
      rotationSpeed: 0.03,
      texture: "dev_mining_turret",
      damageSpawnerOffsets: [ {x: 11, y: 0 } ],
      alternateOffsets: false,
      useAllOffsetsSimultaneously: false,
    },
    devBeam: {
      type: "Beam",
      rotationSpeed: 0.041,
      texture: "dev_mining_turret",
      damageSpawnerOffsets: [ {x: 11, y: 0 } ],
      alternateOffsets: false,
      useAllOffsetsSimultaneously: false,
    },
    devDualBeam: {
      type: "Beam",
      rotationSpeed: 0.041,
      texture: "dev_mining_turret",
      damageSpawnerOffsets: [ {x: 11, y: -4 }, {x: 11, y: 4 } ],
      alternateOffsets: false,
      useAllOffsetsSimultaneously: true,
    },
};