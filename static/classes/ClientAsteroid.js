import { BaseActor } from './BaseActor.js';
import { MovementComponent } from '../shared/MovementComponent.js';
import { InteractionComponent } from './InteractionComponent.js';
import { log, rgbToHex, getRandomInt } from '../shared/Helpers.js'

export class ClientAsteroid extends BaseActor {
    constructor({ scene, x, y, velocity, rotation, className, classData = {} }) {
        super({ scene, x, y });
    
        this.graphics = this.scene.add.graphics({ x: 0, y: 0 });
        this.add(this.graphics);
    
        this.baseColor = classData.color;
        this.color = this.baseColor;
        this.heatedColor = this.generateHeatedColor(); // Red color in hex
        this.createAsteroidShapeFromData(classData.shapeData, this.color);
    
        this.refreshSize();
        this.setRotation();
    
        // Initialize health, heat, and timing properties
        this.health = 100;
        this.heat = 0;
        this.lastDamageTime = 0;
        this.heatTransitionSpeed = 0.1; // Speed of heating
        this.coolingTransitionSpeed = this.heatTransitionSpeed * 0.5; // Speed of cooling
    }

    generateHeatedColor() {
        const minRed = 70; // Minimum value for the red channel
        const redRange = 100; // Range for the red channel to get a random shade
        const redShade = minRed + Math.floor(Math.random() * redRange);
        const greenShade = Math.floor(Math.random() * 30); // Lower value for green channel
        const blueShade = Math.floor(Math.random() * 30); // Lower value for blue channel
        return rgbToHex(redShade, greenShade, blueShade);
    }
        
    colorToHex(color) {
        const hex = color.toString(16);
        return `#${'000000'.substring(0, 6 - hex.length)}${hex}`;
    }    

    interpolateColor(color1, color2, factor) {
        const hex = (x) => {
            x = x.toString(16);
            return x.length === 1 ? '0' + x : x;
        };
    
        // Convert colors to hex strings if they are not already
        color1 = this.colorToHex(color1);
        color2 = this.colorToHex(color2);
    
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
    
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
    
        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));
    
        return parseInt(`0x${hex(r)}${hex(g)}${hex(b)}`, 16);
    }
    
    // Method to create an asteroid shape from data
    createAsteroidShapeFromData(shapeData, color) {
        this.shapeData = shapeData;
        this.graphics.clear(); // Clear previous graphics
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

    takeDamage(amount) {
        this.health -= amount;
        this.heat = Math.min(100, this.heat + amount * this.heatTransitionSpeed);
        this.lastDamageTime = Date.now();
    
        if (this.heat >= 100) {
            console.log("Asteroid heat is at maximum!");
        }
    }
    
    update(deltaTime) {
        this.InteractionComponent.update(deltaTime);
    
        const now = Date.now();
    
        // Handle cooling
        if (now - this.lastDamageTime > 2000 && this.heat > 0) {
            this.heat = Math.max(0, this.heat - this.coolingTransitionSpeed * deltaTime);
        }
    
        // Transition color based on heat
        const heatedColor = this.heatedColor; // Red color in hex
        const interpolatedColor = this.interpolateColor(this.baseColor, heatedColor, this.heat / 100);
        
        this.createAsteroidShapeFromData(this.shapeData, interpolatedColor); // Redraw asteroid with new color
    }    
}