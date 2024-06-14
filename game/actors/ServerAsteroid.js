import { getRandomInt, degToRad, rgbToHex } from "../../shared/helpers.js";
import { ReplicatedActorBase } from "./ReplicatedActorBase.js";

export class ServerAsteroid extends ReplicatedActorBase {
  constructor({id, x = 0, y = 0}) {  
    super({id, x, y})

    this.clientClassName = "ClientAsteroid"
    this.classData = {
      color: this.generateAsteroidColor(),
      shapeData: this.createAsteroidShape(),
    }

    console.log("ROID: ", this)
  }    

  generateAsteroidColor() {
    const minShade = 25;
    const shadeRange = 50;
    const grayShade = minShade + Math.floor(Math.random() * shadeRange);
    return rgbToHex(grayShade, grayShade, grayShade);
  }

  createAsteroidShape({ min = 7, max = 15, radius = 20, variation = 5 } = {}) {
    let shapeData = {
        points: [],
        color: null
    };

    const points = getRandomInt(min, max); // Number of points (vertices)
    shapeData.pointsCount = points;    

    for (let i = 0; i < points; i++) {
      const angle = degToRad((360 / points) * i);
      const distance = radius + getRandomInt(-variation, variation);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      shapeData.points.push({ x, y });
    }

    return shapeData;
  }

  update(deltaTime) {

  }
}