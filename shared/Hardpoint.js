// src/hardpoint.ts
import { HardpointDataTable } from './HardpointDataTable';
import { MathHelper } from "./MathHelper";
export class HardPoint {
    constructor({ id, parentActor, x, y, classData = HardpointDataTable["devBlaster"] }) {
        this.id = id;
        this.parentActor = parentActor;
        this.targetActor = null;
        this.x = 0;
        this.y = 0;
        this.offsetX = x;
        this.offsetY = y;
        this.classData = classData;
        this.damageSpawnPoints = this.classData.damageSpawnerOffsets.length;
        this.currentDamageSpawnerIndex = 0;
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
            let targetAngle = Math.atan2(this.targetActor.y - this.y, this.targetActor.x - this.x);
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
        // Calculate the angle to the target actor
        let targetAngle = Math.atan2(this.targetActor.y - this.y, this.targetActor.x - this.x);
        // Calculate the hardpoint's current angle, which is the parent actor's rotation plus the hardpoint's local rotation
        let currentAngle = this.parentActor.rotation + MathHelper.DegToRad(this.localRotation);
        // Normalize both angles
        targetAngle = MathHelper.Angle.Wrap(targetAngle);
        currentAngle = MathHelper.Angle.Wrap(currentAngle);
        // Calculate the difference between the target angle and the current angle
        let angleDifference = MathHelper.Angle.Wrap(targetAngle - currentAngle);
        // Check if the absolute difference is within a small threshold (e.g., 0.1 radians)
        let facingTarget = Math.abs(angleDifference) <= 0.1;
        return facingTarget;
    }
    getProjectileSpawnPosition() {
        // Calculate the rotation in radians from localRotation in degrees
        const localRotationInRadians = MathHelper.DegToRad(this.localRotation);
        // Calculate the hardpoint's current world rotation (parent rotation + local rotation)
        const worldRotationInRadians = this.parentActor.rotation + localRotationInRadians;
        // Calculate the offset position based on the hardpoint's world rotation
        const offsetX = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.cos(worldRotationInRadians) -
            this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.sin(worldRotationInRadians);
        const offsetY = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.sin(worldRotationInRadians) +
            this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.cos(worldRotationInRadians);
        // Calculate the world position for the projectile spawn
        const projectileX = this.x + offsetX;
        const projectileY = this.y + offsetY;
        return { x: projectileX, y: projectileY };
    }
    update(deltaTime) {
        const offsetX = this.offsetX * Math.cos(this.parentActor.rotation) - this.offsetY * Math.sin(this.parentActor.rotation);
        const offsetY = this.offsetX * Math.sin(this.parentActor.rotation) + this.offsetY * Math.cos(this.parentActor.rotation);
        this.x = this.parentActor.x + offsetX;
        this.y = this.parentActor.y + offsetY;
        this.handleHardpointLocalRotation();
        // Handle firing according to rate of fire
        this.timeSinceLastShot += deltaTime;
        if (this.timeSinceLastShot >= 1000 / this.classData.rateOfFire) {
            this.fire();
            this.timeSinceLastShot = 0;
        }
    }
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
//# sourceMappingURL=Hardpoint.js.map