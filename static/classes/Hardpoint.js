export class Hardpoint {
    constructor({ scene, id, parentActor, x, y, classData = { rotationSpeed: 0.05, texture: "dev_mining_turret"} }) {
        this.scene = scene;
        this.id = id;
        this.parentActor = parentActor;
        this.targetActor = null;
        this.worldX = 0;
        this.worldY = 0;
        this.offsetX = x;
        this.offsetY = y;
        this.rotationSpeed = classData.rotationSpeed; // Speed at which the hardpoint rotates towards its target, in radians per frame

        this.distance = 1000;  // max range of the hardpoint
        this.baseRotation = 0;     // default rotation to face right
        this.localRotation = this.baseRotation;     // default rotation to face right
        this.firingAngle = 300;       // angle of the firing arc

        // Add sprite and set its initial rotation
        this.sprite = scene.add.sprite(0, 0, classData.texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.rotation = Phaser.Math.DegToRad(this.localRotation); // aligns sprite to face right

        this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffff00 } });

        //this.setRotation(129)
    }

    setRotation(degrees) {
        this.localRotation = degrees
    }

    setTarget(actor) {
        this.targetActor = actor;
    }
  
    setVisibility(state) {
        this.sprite.setVisible(state);
        this.graphics.setVisible(state);
    }

    drawAngledArc() {
        const interval = 250;
    
        // Convert rotation and angle from degrees to radians
        let halfAngleRadians = Phaser.Math.DegToRad(this.firingAngle / 2);
        let rotation = Phaser.Math.DegToRad(this.baseRotation) + this.parentActor.rotation;
    
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
            this.graphics.arc(this.worldX, this.worldY, incDistance, startAngleRadians, endAngleRadians, false);
            this.graphics.strokePath();
    
            if (this.firingAngle < 360) {
                this.graphics.beginPath();
                this.graphics.moveTo(this.worldX, this.worldY);
                this.graphics.lineTo(
                    this.worldX + incDistance * Math.cos(startAngleRadians),
                    this.worldY + incDistance * Math.sin(startAngleRadians)
                );
                this.graphics.moveTo(this.worldX, this.worldY);
                this.graphics.lineTo(
                    this.worldX + incDistance * Math.cos(endAngleRadians),
                    this.worldY + incDistance * Math.sin(endAngleRadians)
                );
                this.graphics.strokePath();
            }
    
            if (incDistance > 0) {
                let textPositionAngle = rotation + halfAngleRadians; // Position at the end of the arc
                let textX = this.worldX + (incDistance + 10) * Math.cos(textPositionAngle); // Adjust text position
                let textY = this.worldY + (incDistance + 10) * Math.sin(textPositionAngle); // Adjust text position
                let text = this.scene.add.text(textX, textY, `${incDistance} units`, { color: '#ffffff', fontSize: '14px' });
                this.texts[incDistance] = text; // Store text object for future management
            }
        }
    }
    
    handleHardpointLocalRotation() {
        if (this.targetActor) {
            let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
            let baseAngle = this.parentActor.rotation; // Base rotation from the parent actor
            let currentAngle = baseAngle + Phaser.Math.DegToRad(this.localRotation);
            let deltaAngle = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);
    
            // Calculate the maximum allowable rotation per frame, clamped by rotationSpeed
            let rotationChange = Phaser.Math.Clamp(deltaAngle, -this.rotationSpeed, this.rotationSpeed);
            
            // Proposed new localRotation
            let newLocalRotationRadians = Phaser.Math.Angle.Wrap(Phaser.Math.DegToRad(this.localRotation) + rotationChange);
            let newLocalRotationDegrees = Phaser.Math.RadToDeg(newLocalRotationRadians);
            
            // Check if the new localRotation is within the firingAngle
            let halfFiringAngleRadians = Phaser.Math.DegToRad(this.firingAngle / 2);
            if (Math.abs(Phaser.Math.Angle.ShortestBetween(baseAngle, baseAngle + newLocalRotationRadians)) <= halfFiringAngleRadians) {
                this.localRotation = newLocalRotationDegrees;
            } else {
                // Clamp the localRotation to the nearest edge of the firingAngle
                if (deltaAngle > 0) {
                    this.localRotation = Phaser.Math.RadToDeg(halfFiringAngleRadians);
                } else {
                    this.localRotation = -Phaser.Math.RadToDeg(halfFiringAngleRadians);
                }
            }
        } else {
            // Reset to default localRotation when no target is present
            this.localRotation = 0;
        }
    
        this.sprite.rotation = this.parentActor.rotation + Phaser.Math.DegToRad(this.localRotation);
    }
    

    update() {
        const offsetX = this.offsetX * Math.cos(this.parentActor.rotation) - this.offsetY * Math.sin(this.parentActor.rotation);
        const offsetY = this.offsetX * Math.sin(this.parentActor.rotation) + this.offsetY * Math.cos(this.parentActor.rotation);
        
        this.worldX = this.parentActor.x + offsetX;
        this.worldY = this.parentActor.y + offsetY;
    
        this.sprite.setPosition(this.worldX, this.worldY);
    
        this.handleHardpointLocalRotation()
        this.drawAngledArc();
    }
    
}
