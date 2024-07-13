import { distance, log } from "../shared/Helpers.js";
import { MathHelper } from "../shared/MathHelper.js";
import { HardpointDataTable } from "../shared/HardpointDataTable.js";
import { HardPoint } from "../shared/Hardpoint.js"

export class ClientHardpoint extends HardPoint {
    constructor({ scene, id, parentActor, x, y, classData = HardpointDataTable["devBlaster"] }) {
        super({ id, parentActor, x, y, classData})
        this.scene = scene;
            
        this.drawFiringAngles = false;
        
        // Add sprite and set its initial rotation
        this.sprite = scene.add.sprite(0, 0, classData.texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.rotation = MathHelper.DegToRad(this.localRotation); // aligns sprite to face right
    
        this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffff00 } });
    }

    setVisibility(state) {
        this.sprite.setVisible(state);
        this.graphics.setVisible(state);
    }

    drawAngledArc() {
        if (!this.drawFiringAngles) return;

        const interval = 250;

        // Convert rotation and angle from degrees to radians
        let halfAngleRadians = MathHelper.DegToRad(this.firingAngle / 2);
        let rotation = MathHelper.DegToRad(this.baseRotation) + this.parentActor.rotation;

        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff, 1);

        // Ensure text management is initialized
        if (!this.texts) {
            this.texts = {};
        }

        // Clear existing text objects to avoid duplication
        Object.keys(this.texts).forEach(key => {
            this.texts[key].destroy();
        });

        this.texts = {}; // Reset the text dictionary after clearing

        for (let incDistance = 0; incDistance <= this.distance; incDistance += interval) {
            let startAngleRadians = rotation - halfAngleRadians;
            let endAngleRadians = rotation + halfAngleRadians;

            this.graphics.beginPath();
            this.graphics.arc(this.x, this.y, incDistance, startAngleRadians, endAngleRadians, false);
            this.graphics.strokePath();

            if (this.firingAngle < 360) {
                this.graphics.beginPath();
                this.graphics.moveTo(this.x, this.y);
                this.graphics.lineTo(
                    this.x + incDistance * Math.cos(startAngleRadians),
                    this.y + incDistance * Math.sin(startAngleRadians)
                );
                this.graphics.moveTo(this.x, this.y);
                this.graphics.lineTo(
                    this.x + incDistance * Math.cos(endAngleRadians),
                    this.y + incDistance * Math.sin(endAngleRadians)
                );
                this.graphics.strokePath();
            }

            if (incDistance > 0) {
                let textPositionAngle = rotation + halfAngleRadians; // Position at the end of the arc
                let textX = this.x + (incDistance + 10) * Math.cos(textPositionAngle); // Adjust text position
                let textY = this.y + (incDistance + 10) * Math.sin(textPositionAngle); // Adjust text position
                let text = this.scene.add.text(textX, textY, `${incDistance} units`, { color: '#ffffff', fontSize: '14px' });
                this.texts[incDistance] = text; // Store text object for future management
            }
        }
    }    

    updateSpriteToLocalRotation() {
        // Update the sprite rotation to match the local rotation
        this.sprite.rotation = this.parentActor.rotation + MathHelper.DegToRad(this.localRotation);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.sprite.setPosition(this.x, this.y);
    
        this.updateSpriteToLocalRotation();
        this.drawAngledArc();
    }    
}

export class BeamHardpoint extends ClientHardpoint {
    constructor({ scene, id, parentActor, x, y, classData = HardpointDataTable["devDualBeam"] }) {
        super({ scene, id, parentActor, x, y, classData })

        this.beamSprite = null;
        this.debugGraphics = this.scene.add.graphics();
    }

    activateBeam() {
        // Check if we need to create a beam sprite
        if (this.beamSprite === null) {
            let beamSegment = this.scene.add.sprite(0, 0, 'dev_mining_turret_beam');
            beamSegment.play('beamAnimation'); // Assuming 'beamAnimation' is the key for the animation
            this.beamSprite = beamSegment;
            //console.log("Beam activated with 1 segment");
        }
    }
    
    deactivateBeam() {
        if (!this.beamSprite) return;
        this.beamSprite.destroy();
        this.beamSprite = null;
    }
    
    updateBeam() {
        if (!this.active) {
            this.deactivateBeam();
            return;
        }
    
        const facingTarget = this.isFacingTarget();
    
        if (facingTarget) {
            this.activateBeam();
        } else {
            this.deactivateBeam();
            return;
        }
        
        if (this.targetActor && this.beamSprite) {
            const pos = this.getProjectileSpawnPosition();
            // Calculate the distance and angle to the target
            const dx = this.targetActor.x - pos.x;
            const dy = this.targetActor.y - pos.y;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
    
            // Clamp the distance to the maximum weapon range
            const clampedDistance = Math.min(distanceToTarget, this.distance);
    
            // Update beam position and scale
            this.beamSprite.setPosition(pos.x, pos.y);
            this.beamSprite.setRotation(angle);
    
            // Scale the beam based on the clamped distance and adjust the beam's origin
            this.beamSprite.setScale(clampedDistance / this.beamSprite.width, 1);
            this.beamSprite.setOrigin(0, 0.5); // Set the origin to the start of the beam
        } else {
            this.deactivateBeam();
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.updateBeam();
    }
    
}

export class ProjectileHardpoint extends ClientHardpoint {
    constructor({ scene, id, parentActor, x, y, classData = HardpointDataTable["devBlaster"] }) {
        super({ scene, id, parentActor, x, y, classData });

        this.bullets = [];
        this.rateOfFire = 3; // 10 times a second.
        this.bulletSpeed = 1000; // Speed of the bullet
    }

    createBullet() {
        let bullet = this.scene.add.sprite(this.x, this.y, 'dev_mining_turret_beam');
        bullet.setOrigin(0.5, 0.5);
        bullet.rotation = this.sprite.rotation;
        bullet.speed = this.bulletSpeed;
        bullet.travelledDistance = 0; // Track distance travelled by the bullet
        this.bullets.push(bullet);
    }

    updateBullets(deltaTime) {
        this.bullets.forEach((bullet, index) => {
            let velocityX = Math.cos(bullet.rotation) * bullet.speed * deltaTime / 1000;
            let velocityY = Math.sin(bullet.rotation) * bullet.speed * deltaTime / 1000;
            bullet.x += velocityX;
            bullet.y += velocityY;

            // Update travelled distance
            bullet.travelledDistance += Math.sqrt(velocityX * velocityX + velocityY * velocityY);

            // Remove bullets that travel more than this.distance
            if (bullet.travelledDistance > this.distance) {
                bullet.destroy();
                this.bullets.splice(index, 1);
            }
        });
    }

    fire() {
        if (this.targetActor && this.isFacingTarget()) {
            this.createBullet();
            //console.log(`Firing bullet at target ${this.targetActor.id}`);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.updateBullets(deltaTime);

        // Handle firing according to rate of fire
        // this.timeSinceLastShot += deltaTime;
        // if (this.timeSinceLastShot >= 1000 / this.rateOfFire) {
        //     this.fire();
        //     this.timeSinceLastShot = 0;
        // }
    }
}