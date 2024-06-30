// src/hardpoint.ts
import { HardpointDataTable } from 'HardpointDataTable';
export class TSHardPoint {
    constructor({ id, parentActor, x, y, classData = HardpointDataTable["devBlaster"] }) {
        this.id = id;
        this.parentActor = parentActor;
        this.targetActor = null;
        this.worldX = 0;
        this.worldY = 0;
        this.offsetX = x;
        this.offsetY = y;
        this.classData = classData;
        this.damageSpawnPoints = this.classData.damageSpawnerOffsets.length;
        this.currentDamageSpawnerIndex = 0;
        this.rotationSpeed = classData.rotationSpeed; // Speed at which the hardpoint rotates towards its target, in radians per frame
        this.damagePerHit = 1;
        this.rateOfFire = 10; // 10 times a second.
        this.timeSinceLastShot = 0; // Time tracker for rate of fire
        this.distance = 1000; // max range of the hardpoint
        this.baseRotation = 0; // default rotation to face right
        this.localRotation = this.baseRotation; // default rotation to face right
        this.firingAngle = 360; // angle of the firing arc
        this.drawFiringAngles = false;
        this.active = false;
    }
    // Example of a void method
    activate() {
        this.active = true;
    }
}
