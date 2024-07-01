// src/hardpoint.ts
//import { HardpointDataTable, HardpointDataTableEntry } from './HardpointDataTable';
import { MathHelper } from "./MathHelper.js";
export class HardPoint {
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
        //this.rotationSpeed = classData.rotationSpeed; // Speed at which the hardpoint rotates towards its target, in radians per frame
        //this.damagePerHit = 1;
        //this.rateOfFire = 10; // 10 times a second.
        this.timeSinceLastShot = 0; // Time tracker for rate of fire
        this.distance = 1000; // max range of the hardpoint
        this.baseRotation = 0; // default rotation to face right
        this.localRotation = this.baseRotation; // default rotation to face right
        this.firingAngle = 360; // angle of the firing arc
        this.active = false;
    }
    setRotation(degrees) {
        this.localRotation = degrees;
    }
    handleHardpointLocalRotation() {
        // Get the base rotation from the parent actor
        let baseAngle = this.parentActor.rotation;
        let currentAngle = baseAngle + MathHelper.DegToRad(this.localRotation);
        let deltaAngle = 0;
        let setHardpointToHomePosition = false;
        if (this.targetActor) {
            // Calculate the angle from the hardpoint to the target
            let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
            deltaAngle = MathHelper.Angle.Wrap(targetAngle - currentAngle);
            // Calculate the half angle of the firing arc in radians
            let halfFiringAngleRadians = MathHelper.DegToRad(this.firingAngle / 2);
            let relativeTargetAngle = MathHelper.Angle.Wrap(targetAngle - baseAngle);
            // Check if the target is within the dead zone
            if (Math.abs(relativeTargetAngle) > halfFiringAngleRadians) {
                setHardpointToHomePosition = true;
            }
        }
        else {
            setHardpointToHomePosition = true;
        }
        if (setHardpointToHomePosition) {
            // Gradually rotate back to the home position (0 degrees) if no target
            deltaAngle = MathHelper.Angle.Wrap(baseAngle - currentAngle);
        }
        // Calculate the maximum allowable rotation per frame, clamped by rotationSpeed
        let rotationChange = MathHelper.Clamp(deltaAngle, -this.classData.rotationSpeed, this.classData.rotationSpeed);
        // Apply the rotation change
        let newLocalRotationRadians = MathHelper.Angle.Wrap(currentAngle + rotationChange);
        this.setRotation(MathHelper.RadToDeg(newLocalRotationRadians - baseAngle));
    }
    IncrementSpawnerIndex() {
        if (!this.classData.alternateOffsets)
            return;
        this.currentDamageSpawnerIndex++;
        if (this.currentDamageSpawnerIndex == this.damageSpawnPoints) {
            this.currentDamageSpawnerIndex = 0;
        }
    }
    isFacingTarget() {
        if (!this.targetActor)
            return false;
        // Calculate the angle from the hardpoint to the target in radians
        let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
        let currentAngle = MathHelper.DegToRad(this.localRotation);
        // Normalize angles to the range [-PI, PI]
        targetAngle = MathHelper.Angle.Wrap(targetAngle);
        currentAngle = MathHelper.Angle.Wrap(currentAngle);
        // Calculate the absolute difference between the target angle and the current angle
        let angleDifference = MathHelper.Angle.Wrap(targetAngle - currentAngle);
        let facingTarget = Math.abs(angleDifference) <= 0.01;
        return facingTarget;
    }
    getProjectileSpawnPosition() {
        // Calculate the rotation in radians from localRotation in degrees
        const rotationInRadians = MathHelper.DegToRad(this.localRotation);
        // Calculate the offset position based on the hardpoint's rotation
        const offsetX = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.cos(rotationInRadians) -
            this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.sin(rotationInRadians);
        const offsetY = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.sin(rotationInRadians) +
            this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.cos(rotationInRadians);
        // Calculate the world position for the projectile spawn
        const projectileX = this.worldX + offsetX;
        const projectileY = this.worldY + offsetY;
        return { x: projectileX, y: projectileY };
    }
    update(deltaTime) {
        const offsetX = this.offsetX * Math.cos(this.parentActor.rotation) - this.offsetY * Math.sin(this.parentActor.rotation);
        const offsetY = this.offsetX * Math.sin(this.parentActor.rotation) + this.offsetY * Math.cos(this.parentActor.rotation);
        this.worldX = this.parentActor.x + offsetX;
        this.worldY = this.parentActor.y + offsetY;
        //this.sprite.setPosition(this.worldX, this.worldY);
        this.handleHardpointLocalRotation();
        //this.updateSpriteToLocalRotation();
        //this.drawAngledArc();
        // Handle firing according to rate of fire
        this.timeSinceLastShot += deltaTime;
        if (this.timeSinceLastShot >= 1000 / this.classData.rateOfFire) {
            this.fire();
            this.timeSinceLastShot = 0;
        }
    }
    // private getProjectileSpawnPosition(): Vector2d {
    //   // Calculate the offset position based on the hardpoint's rotation
    //   const offsetX = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.cos(this.localRotation) - this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.sin(this.localRotation);
    //   const offsetY = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.sin(this.localRotation) + this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.cos(this.localRotation);
    //   // Calculate the world position for the projectile spawn
    //   const projectileX = this.worldX + offsetX;
    //   const projectileY = this.worldY + offsetY;
    //   return { x: projectileX, y: projectileY };
    // }
    ////////////
    // Public //
    ////////////
    activate() {
        if (this.active)
            return;
        this.active = true;
    }
    deactivate() {
        if (!this.active)
            return;
        this.active = false;
    }
    setTarget(actor) {
        this.targetActor = actor;
        if (actor === null) {
            this.deactivate();
        }
        else {
            this.activate();
        }
    }
    fire() {
        if (this.targetActor && this.isFacingTarget() && this.active) {
            this.IncrementSpawnerIndex();
            this.targetActor.takeDamage(this.classData.damagePerHit);
        }
    }
}
export const HardpointDataTable = {
    devBlaster: {
        type: "Projectile",
        rotationSpeed: 0.03,
        texture: "dev_mining_turret",
        rateOfFire: 3,
        damagePerHit: 1,
        damageSpawnerOffsets: [{ x: 11, y: 0 }],
        alternateOffsets: false,
    },
    devBeam: {
        type: "Beam",
        rotationSpeed: 0.041,
        texture: "dev_mining_turret",
        rateOfFire: 10,
        damagePerHit: 1,
        damageSpawnerOffsets: [{ x: 11, y: 0 }],
        alternateOffsets: false,
    },
    devDualBeam: {
        type: "Beam",
        rotationSpeed: 0.041,
        texture: "dev_mining_turret",
        rateOfFire: 10,
        damagePerHit: 1,
        damageSpawnerOffsets: [{ x: 11, y: -4 }, { x: 11, y: 4 }],
        alternateOffsets: true,
    },
};
//# sourceMappingURL=Hardpoint.js.map