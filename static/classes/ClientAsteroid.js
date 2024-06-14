import { MovementComponent } from '../shared/MovementComponent.js';
import { InteractionComponent } from './InteractionComponent.js';
import { log, rgbToHex } from '../shared/helpers.js'

export class ClientAsteroid extends Phaser.GameObjects.Container {
    constructor({ scene, x, y, velocity, rotation, className, classData = {} }) {
        super(scene, x, y, '');
        this.scene = scene;
        this.setPosition(x, y);
        this.scene.add.existing(this);
        //this.classData = classData;

        scene.physics.world.enable(this);

        this.graphics = this.scene.add.graphics({ x: 0, y: 0 });
        this.add(this.graphics)

        log.debug("asteroid classData", {scene, x, y, velocity, rotation, className, classData})
        if (classData.shapeData) {
            this.createAsteroidShapeFromData(classData.shapeData, classData.color);
            log.debug("Generated Asteroid from Server Data!")
        } else {
            this.createAsteroidShape();
        }
        
        let { centerX, centerY, radius } = this.getShapeBounds()
        this.setSize(radius, radius); // Set size for interaction
        this.setInteractive();

        this.setBounds();
        this.setRotation();
        this.InteractionComponent = new InteractionComponent({ actor: this })
        log.info("Asteroid Ready!")
    }

    // Method to create a random asteroid shape
    // createAsteroidShape({ min = 7, max = 15, radius = 20, variation = 5 } = {}) {
    //     this.shapeData = {
    //         points: [],
    //         color: null
    //     };

    //     const points = Phaser.Math.Between(min, max); // Number of points (vertices)
    //     this.shapeData.pointsCount = points;

    //     const minShade = 25;
    //     const shadeRange = 50;
    //     const grayShade = minShade + Math.floor(Math.random() * shadeRange);
    //     const color = rgbToHex(grayShade, grayShade, grayShade);
    //     this.shapeData.color = color;

    //     this.graphics.fillStyle(color, 1.0); // Fill color
    //     this.graphics.beginPath();
    //     for (let i = 0; i < points; i++) {
    //         const angle = Phaser.Math.DegToRad((360 / points) * i);
    //         const distance = radius + Phaser.Math.Between(-variation, variation);
    //         const x = Math.cos(angle) * distance;
    //         const y = Math.sin(angle) * distance;
    //         this.shapeData.points.push({ x, y });
    //         if (i === 0) {
    //             this.graphics.moveTo(x, y);
    //         } else {
    //             this.graphics.lineTo(x, y);
    //         }
    //     }
    //     this.graphics.closePath();
    //     this.graphics.fillPath();
    // }

    // Method to create an asteroid shape from data
    createAsteroidShapeFromData(shapeData, color) {
        this.shapeData = shapeData;
        this.graphics.fillStyle(color, 1.0); // Fill color
        this.graphics.beginPath();
        shapeData.points.forEach((point, index) => {
            if (index === 0) {
                this.graphics.moveTo(point.x, point.y);
            } else {
                this.graphics.lineTo(point.x, point.y);
            }
        });
        this.graphics.closePath();
        this.graphics.fillPath();
    }

    setVisiblity(state) {
        this.setVisible(state);
    }

    // Method to set the physics body bounds
    setBounds() {
        const bounds = this.getShapeBounds();
        this.body.setCircle(bounds.radius);
        this.body.setOffset(bounds.centerX - bounds.radius, bounds.centerY - bounds.radius);
    }

    // Method to get the maximum bounds regardless of rotation
    getMaxBounds() {
        let { minX, minY, maxX, maxY } = this.getShapeBounds();
        const vertices = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
        ];

        let maxDistX = 0, maxDistY = 0;

        vertices.forEach(vertex => {
            vertices.forEach(otherVertex => {
                const distX = Math.abs(vertex.x - otherVertex.x);
                const distY = Math.abs(vertex.y - otherVertex.y);
                if (distX > maxDistX) maxDistX = distX;
                if (distY > maxDistY) maxDistY = distY;
            });
        });

        return { width: maxDistX, height: maxDistY };
    }

    // Method to get the shape bounds in local space
    getShapeBounds() {
        let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        this.shapeData.points.forEach(point => {
            if (point.x < minX) minX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.x > maxX) maxX = point.x;
            if (point.y > maxY) maxY = point.y;
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radius = Math.max(width, height) / 2;

        return { minX, minY, maxX, maxY, centerX, centerY, width, height, radius };
    }

    // Method to get the bounds in world space
    getBounds() {
        let { minX, minY, width, height } = this.getShapeBounds();
        const worldX = this.x + minX;
        const worldY = this.y + minY;
        return { x: worldX, y: worldY, width: width, height: height };
    }

    // Method to set random rotation for the asteroid
    setRotation() {
        this.body.angularVelocity = Phaser.Math.Between(-25, 25);
    }

    // Method to get the shape data for serialization
    getShapeData() {
        return this.shapeData;
    }

    update(deltaTime) {
        this.InteractionComponent.update(deltaTime);
    }
}