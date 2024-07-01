// src/hardpoint.ts
import { HardpointDataTable } from './HardpointDataTable.js';
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
        let baseAngle = this.parentActor.rotation;
        let currentAngle = baseAngle + MathHelper.DegToRad(this.localRotation);
        let deltaAngle = 0;
        let setHardpointToHomePosition = false;
        if (this.targetActor) {
            let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
            deltaAngle = MathHelper.Angle.Wrap(targetAngle - currentAngle);
            let halfFiringAngleRadians = MathHelper.DegToRad(this.firingAngle / 2);
            let relativeTargetAngle = MathHelper.Angle.Wrap(targetAngle - baseAngle);
            if (Math.abs(relativeTargetAngle) > halfFiringAngleRadians) {
                setHardpointToHomePosition = true;
            }
        }
        else {
            setHardpointToHomePosition = true;
        }
        if (setHardpointToHomePosition) {
            deltaAngle = MathHelper.Angle.Wrap(baseAngle - currentAngle);
        }
        let rotationChange = MathHelper.Clamp(deltaAngle, -this.classData.rotationSpeed, this.classData.rotationSpeed);
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
        let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
        let currentAngle = MathHelper.DegToRad(this.localRotation);
        targetAngle = MathHelper.Angle.Wrap(targetAngle);
        currentAngle = MathHelper.Angle.Wrap(currentAngle);
        let angleDifference = MathHelper.Angle.Wrap(targetAngle - currentAngle);
        let facingTarget = Math.abs(angleDifference) <= 0.1;
        console.log(Math.abs(angleDifference));
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
        this.handleHardpointLocalRotation();
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
        console.log(this.isFacingTarget(), this.active);
        if (this.targetActor && this.isFacingTarget() && this.active) {
            this.IncrementSpawnerIndex();
            this.targetActor.takeDamage(this.classData.damagePerHit);
        }
    }
}
//# sourceMappingURL=Hardpoint.js.map