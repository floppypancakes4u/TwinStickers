// src/hardpointData.ts
export const HardpointDataTable = {
    devBlaster: {
        type: "Projectile",
        rotationSpeed: 0.03,
        texture: "dev_mining_turret",
        damageSpawnerOffsets: [{ x: 11, y: 0 }],
        alternateOffsets: false,
    },
    devBeam: {
        type: "Beam",
        rotationSpeed: 0.041,
        texture: "dev_mining_turret",
        damageSpawnerOffsets: [{ x: 11, y: 0 }],
        alternateOffsets: false,
    },
    devDualBeam: {
        type: "Beam",
        rotationSpeed: 0.041,
        texture: "dev_mining_turret",
        damageSpawnerOffsets: [{ x: 11, y: -4 }, { x: 11, y: 4 }],
        alternateOffsets: true,
    },
};
//# sourceMappingURL=HardpointDataTable.js.map