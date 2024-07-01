// src/hardpoint.ts

//import { HardpointDataTable, HardpointDataTableEntry } from './HardpointDataTable';
import { MathHelper } from "MathHelper";

interface Vector2d {
  x: number,
  y: number
}

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
		// Get the base rotation from the parent actor
		let baseAngle: number = this.parentActor.rotation;
		let currentAngle: number = baseAngle + MathHelper.DegToRad(this.localRotation);
		let deltaAngle: number = 0;
		let setHardpointToHomePosition: boolean = false;

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
		} else {
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

  private IncrementSpawnerIndex(): void {
    if (!this.classData.alternateOffsets) return;
    
    this.currentDamageSpawnerIndex++;

    if (this.currentDamageSpawnerIndex == this.damageSpawnPoints) {
        this.currentDamageSpawnerIndex = 0;
    }
  }

	private isFacingTarget(): boolean {
    if (!this.targetActor) return false;

    // Calculate the angle from the hardpoint to the target in radians
    let targetAngle: number = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
    let currentAngle: number = MathHelper.DegToRad(this.localRotation);

    // Normalize angles to the range [-PI, PI]
    targetAngle = MathHelper.Angle.Wrap(targetAngle);
    currentAngle = MathHelper.Angle.Wrap(currentAngle);

    // Calculate the absolute difference between the target angle and the current angle
    let angleDifference: number = MathHelper.Angle.Wrap(targetAngle - currentAngle);
    let facingTarget: boolean = Math.abs(angleDifference) <= 0.01;

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
		if (this.targetActor && this.isFacingTarget() && this.active) {
        this.IncrementSpawnerIndex();
				this.targetActor.takeDamage(this.classData.damagePerHit);
		}
	} 
}













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