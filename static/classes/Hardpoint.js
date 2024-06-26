import { distance } from "../shared/helpers.js";

export class Hardpoint {
    constructor({ scene, id, parentActor, x, y, classData = { rotationSpeed: 0.01, texture: "dev_mining_turret" } }) {
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
        this.firingAngle = 360;       // angle of the firing arc
        this.drawFiringAngles = false;

        // Add sprite and set its initial rotation
        this.sprite = scene.add.sprite(0, 0, classData.texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.rotation = Phaser.Math.DegToRad(this.localRotation); // aligns sprite to face right

        this.graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffff00 } });

        this.beamSprites = [];

        this.active = false;
    }

    setRotation(degrees) {
        this.localRotation = degrees;
    }

    setTarget(actor) {
        console.log("setTarget set to ", actor);
        this.targetActor = actor;
        this.activate();
    }

    setVisibility(state) {
        this.sprite.setVisible(state);
        this.graphics.setVisible(state);
    }

    drawAngledArc() {
        if (!this.drawFiringAngles) return;

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
        // Get the base rotation from the parent actor
        let baseAngle = this.parentActor.rotation;
        let currentAngle = baseAngle + Phaser.Math.DegToRad(this.localRotation);
        let deltaAngle;
        let setHardpointToHomePosition = false;
        if (this.targetActor) {
            // Calculate the angle from the hardpoint to the target
            let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
            deltaAngle = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);

            // Calculate the half angle of the firing arc in radians
            let halfFiringAngleRadians = Phaser.Math.DegToRad(this.firingAngle / 2);
            let relativeTargetAngle = Phaser.Math.Angle.Wrap(targetAngle - baseAngle);

            // Check if the target is within the dead zone
            if (Math.abs(relativeTargetAngle) > halfFiringAngleRadians) {
                console.log('Target is in the dead zone of the hardpoint.');
                setHardpointToHomePosition = true;
            }
        } else {
            setHardpointToHomePosition = true;
        }

        if (setHardpointToHomePosition) {
            // Gradually rotate back to the home position (0 degrees) if no target
            deltaAngle = Phaser.Math.Angle.Wrap(baseAngle - currentAngle);
        }

        // Calculate the maximum allowable rotation per frame, clamped by rotationSpeed
        let rotationChange = Phaser.Math.Clamp(deltaAngle, -this.rotationSpeed, this.rotationSpeed);

        // Apply the rotation change
        let newLocalRotationRadians = Phaser.Math.Angle.Wrap(currentAngle + rotationChange);
        this.localRotation = Phaser.Math.RadToDeg(newLocalRotationRadians - baseAngle);

        // Update the sprite rotation to match the local rotation
        this.sprite.rotation = baseAngle + Phaser.Math.DegToRad(this.localRotation);
    }
    updateBeam() {
        if (!this.active) return;
    
        if (!this.targetActor || !this.isFacingTarget()) {
            this.deactivate();
            return;
        }
    
        let targetDistance = distance(this.parentActor, this.targetActor);
        let angle = this.sprite.rotation;
        let segmentLength = 32;
    
        // Determine the number of beam segments needed
        let segmentCount = Math.ceil(targetDistance / segmentLength);
    
        // Add or remove segments as necessary
        while (this.beamSprites.length < segmentCount) {
            let beamSegment = this.scene.add.sprite(0, 0, 'dev_mining_turret_beam');
            beamSegment.play('beamAnimation'); // Assuming 'beamAnimation' is the key for the animation
            this.beamSprites.push(beamSegment);
        }
        while (this.beamSprites.length > segmentCount) {
            this.beamSprites.pop().destroy();
        }
    
        // Update position and rotation of each beam segment
        this.beamSprites.forEach((beam, i) => {
            let segmentX = this.worldX + Math.cos(angle) * (i * segmentLength + segmentLength / 2);
            let segmentY = this.worldY + Math.sin(angle) * (i * segmentLength + segmentLength / 2);
            beam.setPosition(segmentX, segmentY);
            beam.rotation = angle;
        
            // Adjust the last segment to start at the end location and rotate towards the hardpoint
            if (i === this.beamSprites.length - 1) {
                let endX = this.worldX + Math.cos(angle) * targetDistance;
                let endY = this.worldY + Math.sin(angle) * targetDistance;
                beam.setPosition(endX, endY);
        
                let lastSegmentAngle = Math.atan2(this.worldY - endY, this.worldX - endX);
                beam.rotation = lastSegmentAngle;
        
                beam.displayWidth = segmentLength; // Reset to original segment length if needed
        
                // Add one more segment to the end of the last segment
                let additionalSegmentX = endX + Math.cos(lastSegmentAngle) * segmentLength;
                let additionalSegmentY = endY + Math.sin(lastSegmentAngle) * segmentLength;
                let additionalSegment = this.scene.add.sprite(additionalSegmentX, additionalSegmentY, 'dev_mining_turret_beam');
                additionalSegment.play('beamAnimation'); // Assuming 'beamAnimation' is the key for the animation
                additionalSegment.rotation = lastSegmentAngle;
        
                this.beamSprites.push(additionalSegment);
            } else {
                beam.displayWidth = segmentLength;
            }
        });
              
    }
    
    
    isFacingTarget() {
        if (!this.targetActor) return false;

        // Calculate the angle from the hardpoint to the target
        let targetAngle = Math.atan2(this.targetActor.y - this.worldY, this.targetActor.x - this.worldX);
        let currentAngle = this.sprite.rotation;

        // Check if the target is within the firing arc
        let halfFiringAngleRadians = Phaser.Math.DegToRad(this.firingAngle / 2);
        let relativeTargetAngle = Phaser.Math.Angle.Wrap(targetAngle - currentAngle);

        return Math.abs(relativeTargetAngle) <= halfFiringAngleRadians;
    }

    activate() {
        if (this.active) return;
        this.active = true;
    
        let targetDistance = distance(this.parentActor, this.targetActor);
        let angle = this.sprite.rotation;
        let segmentLength = 32; // Assuming the beam sprite is 32 pixels long
        let segmentCount = Math.ceil(targetDistance / segmentLength);
    
        for (let i = 0; i < segmentCount; i++) {
            let segmentX = this.worldX + Math.cos(angle) * (i * segmentLength + segmentLength / 2);
            let segmentY = this.worldY + Math.sin(angle) * (i * segmentLength + segmentLength / 2);
            let beamSegment = this.scene.add.sprite(segmentX, segmentY, 'dev_mining_turret_beam');
    
            // Set up the animation for the beam segment
            beamSegment.play('beamAnimation'); // Assuming 'beamAnimation' is the key for the animation
    
            beamSegment.rotation = angle;
            this.beamSprites.push(beamSegment);
        }
    
        console.log("Beam activated with", this.beamSprites.length, "segments");
    }
    
    deactivate() {
        if (!this.active) return;
        this.active = false;
        this.beamSprites.forEach(beam => beam.destroy());
        this.beamSprites = [];
        //log.debug("Beam deactivated");
    }

    update() {
        const offsetX = this.offsetX * Math.cos(this.parentActor.rotation) - this.offsetY * Math.sin(this.parentActor.rotation);
        const offsetY = this.offsetX * Math.sin(this.parentActor.rotation) + this.offsetY * Math.cos(this.parentActor.rotation);

        this.worldX = this.parentActor.x + offsetX;
        this.worldY = this.parentActor.y + offsetY;

        this.sprite.setPosition(this.worldX, this.worldY);

        this.handleHardpointLocalRotation();
        this.drawAngledArc();
        this.updateBeam();
    }
}
