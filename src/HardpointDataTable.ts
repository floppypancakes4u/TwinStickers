interface DamagerOffset {
  x: number;
  y: number;
}

export interface HardpointDataTableEntry {
  type: string;
  rotationSpeed: number;
  texture: string;
	rateOfFire: number; // 10 times a second.
	damagePerHit: number;
  damageSpawnerOffsets: DamagerOffset[];
  alternateOffsets: boolean;
}

interface HardpointData {
  [key: string]: HardpointDataTableEntry;
}
  
export const HardpointDataTable: HardpointData = {
    devBlaster: {
      type: "Projectile",
      rotationSpeed: 0.03,
      texture: "dev_mining_turret",
			rateOfFire: 3,
			damagePerHit: 1,
      damageSpawnerOffsets: [ {x: 11, y: 0 } ],
      alternateOffsets: false,
    },
    devBeam: {
      type: "Beam",
      rotationSpeed: 0.041,
      texture: "dev_mining_turret",
			rateOfFire: 10,
			damagePerHit: 1,
      damageSpawnerOffsets: [ {x: 11, y: 0 } ],
      alternateOffsets: false,
    },
    devDualBeam: {
      type: "Beam",
      rotationSpeed: 0.041,
      texture: "dev_mining_turret",
			rateOfFire: 10,
			damagePerHit: 1,
      damageSpawnerOffsets: [ {x: 11, y: -4 }, {x: 11, y: 4 } ],
      alternateOffsets: true,
    },
};