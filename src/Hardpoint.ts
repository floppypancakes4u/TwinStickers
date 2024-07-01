// src/hardpoint.ts

import { HardpointDataTable, HardpointDataTableEntry } from './HardpointDataTable';
import { MathHelper } from "MathHelper";
import { Vector2d } from "Helpers";

interface HardpointConstructor {
  id: any;
  parentActor: any;
  x: number;
  y: number;
  classData?: HardpointDataTableEntry;
}

export class HardPoint {
  private id: any;
  private parentActor: any;
  private targetActor: any | null;
  private worldX: number;
  private worldY: number;
  private offsetX: number;
  private offsetY: number;
  private classData: HardpointDataTableEntry;
  private damageSpawnPoints: number;
  private currentDamageSpawnerIndex: number;
  //private rotationSpeed: number;
  //private damagePerHit: number;
  //private rateOfFire: number;
  private timeSinceLastShot: number;
  private distance: number;
  private baseRotation: number;
  private localRotation: number;
  private firingAngle: number;
  //private drawFiringAngles: boolean;
  private active: boolean;

  constructor({ id, parentActor, x, y, classData = HardpointDataTable["devBlaster"] }: HardpointConstructor) {
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
    
    this.distance = 1000;  // max range of the hardpoint
    this.baseRotation = 0;     // default rotation to face right
    this.localRotation = this.baseRotation;     // default rotation to face right
    this.firingAngle = 360;       // angle of the firing arc
    
    this.active = false;
  }

  private setRotation(degrees : number): void {
      this.localRotation = degrees;
  }

	private handleHardpointLocalRotation(): void {
    let baseAngle: number = this.parentActor.rotation;
    let currentAngle: number = baseAngle + MathHelper.DegToRad(this.localRotation);
    let deltaAngle: number = 0;
    let setHardpointToHomePosition: boolean = false;
  
    if (this.targetActor) {
        let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
        deltaAngle = MathHelper.Angle.Wrap(targetAngle - currentAngle);
  
        let halfFiringAngleRadians = MathHelper.DegToRad(this.firingAngle / 2);
        let relativeTargetAngle = MathHelper.Angle.Wrap(targetAngle - baseAngle);
  
        if (Math.abs(relativeTargetAngle) > halfFiringAngleRadians) {
            setHardpointToHomePosition = true;
        }
    } else {
        setHardpointToHomePosition = true;
    }
  
    if (setHardpointToHomePosition) {
        deltaAngle = MathHelper.Angle.Wrap(baseAngle - currentAngle);
    }
  
    let rotationChange = MathHelper.Clamp(deltaAngle, -this.classData.rotationSpeed, this.classData.rotationSpeed);
    let newLocalRotationRadians = MathHelper.Angle.Wrap(currentAngle + rotationChange);
    this.setRotation(MathHelper.RadToDeg(newLocalRotationRadians - baseAngle));
  }
  

  private IncrementSpawnerIndex(): void {
    if (!this.classData.alternateOffsets) return;
    
    this.currentDamageSpawnerIndex++;

    if (this.currentDamageSpawnerIndex == this.damageSpawnPoints) {
        this.currentDamageSpawnerIndex = 0;
    }
  }

	private isFacingTarget(): boolean {
    if (!this.targetActor) return false;
  
    let targetAngle: number = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
    let currentAngle: number = MathHelper.DegToRad(this.localRotation);
  
    targetAngle = MathHelper.Angle.Wrap(targetAngle);
    currentAngle = MathHelper.Angle.Wrap(currentAngle);
  
    let angleDifference: number = MathHelper.Angle.Wrap(targetAngle - currentAngle);
    let facingTarget: boolean = Math.abs(angleDifference) <= 0.1;
    console.log(Math.abs(angleDifference))
    return facingTarget;
  } 

	private getProjectileSpawnPosition(): Vector2d {
		// Calculate the rotation in radians from localRotation in degrees
		const rotationInRadians: number = MathHelper.DegToRad(this.localRotation);

		// Calculate the offset position based on the hardpoint's rotation
		const offsetX: number = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.cos(rotationInRadians) -
														this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.sin(rotationInRadians);
		const offsetY: number = this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].x * Math.sin(rotationInRadians) +
														this.classData.damageSpawnerOffsets[this.currentDamageSpawnerIndex].y * Math.cos(rotationInRadians);

		// Calculate the world position for the projectile spawn
		const projectileX: number = this.worldX + offsetX;
		const projectileY: number = this.worldY + offsetY;

		return { x: projectileX, y: projectileY };
	}

	private update(deltaTime: number): void {
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
  public activate(): void {
    if (this.active) return;
      this.active = true;    
    }

  public deactivate(): void {
        if (!this.active) return;
        this.active = false;
    }
  
  public setTarget(actor : any): void {
    this.targetActor = actor;

    if (actor === null) {
        this.deactivate();
    } else {
        this.activate();
    }
  }

	public fire(): void {
    console.log(this.isFacingTarget(), this.active)
		if (this.targetActor && this.isFacingTarget() && this.active) {
        this.IncrementSpawnerIndex();
				this.targetActor.takeDamage(this.classData.damagePerHit);
		}
	} 
}