import { BaseActor } from './BaseActor.js';
import { MovementComponent } from '../shared/MovementComponent.js';
import { InteractionComponent } from './InteractionComponent.js';
import { log, rgbToHex } from '../shared/helpers.js'

export class ClientAsteroid extends BaseActor {
    constructor({ scene, x, y, velocity, rotation, className, classData = {} }) {
        super({scene, x, y});

        this.graphics = this.scene.add.graphics({ x: 0, y: 0 });
        this.add(this.graphics)

        this.createAsteroidShapeFromData(classData.shapeData, classData.color);
        
        //let { centerX, centerY, radius } = this.getShapeBounds()
        // this.setSize(radius, radius); // Set size for interaction
        
        this.refreshSize();
        this.setRotation();
    }

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

    // setVisiblity(state) {
    //     this.setVisible(state);
    // }

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