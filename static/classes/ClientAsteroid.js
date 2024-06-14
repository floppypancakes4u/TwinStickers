import { MovementComponent } from '../shared/MovementComponent.js';
import { ActorManagerClient } from '../utility/ActorManagerClient.js';
import { log } from '../shared/helpers.js'

export class ClientAsteroid extends Phaser.GameObjects.Graphics {
    constructor({scene, x, y}) {
        super(scene, x, y);
        this.scene = scene;
        this.createAsteroidShape();
        this.scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.setCircle(40); // Assuming a rough circle collision area
        this.setVelocity();
        this.setRotation();
    }

    // Method to create a random asteroid shape
    createAsteroidShape() {
        const points = Phaser.Math.Between(5, 9); // Number of points (vertices)
        const radius = 40; // Average radius of the asteroid
        const variation = 10; // Variation in radius

        this.fillStyle(0x888888, 1.0); // Fill color
        this.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = Phaser.Math.DegToRad((360 / points) * i);
            const distance = radius + Phaser.Math.Between(-variation, variation);
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            if (i === 0) {
                this.moveTo(x, y);
            } else {
                this.lineTo(x, y);
            }
        }
        this.closePath();
        this.fillPath();
    }

    // Method to set random velocity for the asteroid
    setVelocity() {
        const angle = Phaser.Math.Between(0, 360);
        const speed = Phaser.Math.Between(50, 150);
        this.scene.physics.velocityFromAngle(angle, speed, this.body.velocity);
    }

    // Method to set random rotation for the asteroid
    setRotation() {
        this.body.angularVelocity = Phaser.Math.Between(-50, 50);
    }
}