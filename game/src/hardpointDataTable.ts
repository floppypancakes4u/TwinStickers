// src/hardpointData.ts

interface DamagerOffset {
  x: number;
  o: number;
}

interface Hardpoint {
  type: string;
  rotationSpeed: number;
  texture: string;
  damagerOffsets: DamagerOffset[];
}

interface HardpointData {
  [key: string]: Hardpoint;
}
  
export const HardpointDataTable: HardpointData = {
    devBlaster: {
      type: "Projectile",
      rotationSpeed: 0.03,
      texture: "dev_mining_turret",
      damagerOffsets: [ {x: 11, o: 0 } ],
    },
    devBeam: {
      type: "Beam",
      rotationSpeed: 0.041,
      texture: "dev_mining_turret",
      damagerOffsets: [ {x: 11, o: 0 } ],
    },
};