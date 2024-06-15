//import { log } from '../../shared/helpers.js';
import { log } from '../shared/helpers.js';
import { ActorManagerClient } from '../utility/ActorManagerClient.js';

export class InteractionComponent {
  constructor({ actor }) {
    this.actor = actor;
    this.scene = actor.scene;

    this.actorHovered = false;
    this.actorSelected = false;

    this.reticle = this.scene.add.graphics();

    this.actor.on('pointerover', () => {
      //log.debug("pointerover this:", this)
      this.actorHovered = true;
      ActorManagerClient.setHoveredEntity(this.actor);
    });

    this.actor.on('pointerout', () => {
      this.actorHovered = false;
      if (!this.actorSelected) {
        this.reticle.clear();
        ActorManagerClient.setHoveredEntity(this.actor);
      }
    });
  }

  drawReticle(color, multiplier = 1) {
    const { x, y, width, height } = this.actor.getBounds();
    const cornerSize = 5;

    const adjustedWidth = width * multiplier;
    const adjustedHeight = height * multiplier;
    const adjustedX = x - (adjustedWidth - width) / 2;
    const adjustedY = y - (adjustedHeight - height) / 2;

    this.reticle.clear();
    this.reticle.lineStyle(2, color, 1);
    this.reticle.strokeLineShape(new Phaser.Geom.Line(adjustedX, adjustedY, adjustedX + cornerSize, adjustedY));
    this.reticle.strokeLineShape(new Phaser.Geom.Line(adjustedX, adjustedY, adjustedX, adjustedY + cornerSize));
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(adjustedX + adjustedWidth, adjustedY, adjustedX + adjustedWidth - cornerSize, adjustedY)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(adjustedX + adjustedWidth, adjustedY, adjustedX + adjustedWidth, adjustedY + cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(adjustedX, adjustedY + adjustedHeight, adjustedX + cornerSize, adjustedY + adjustedHeight)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(adjustedX, adjustedY + adjustedHeight, adjustedX, adjustedY + adjustedHeight - cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        adjustedX + adjustedWidth,
        adjustedY + adjustedHeight,
        adjustedX + adjustedWidth - cornerSize,
        adjustedY + adjustedHeight
      )
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        adjustedX + adjustedWidth,
        adjustedY + adjustedHeight,
        adjustedX + adjustedWidth,
        adjustedY + adjustedHeight - cornerSize
      )
    );
}


  updateReticle() {
    //console.log("updateReticle", this.actorHovered, this.actorSelected)
    if (this.actorHovered && !this.actorSelected) {
      console.log("should draw ret hover")
      this.drawReticle(0x636262);
      return;
    }

    if (this.actorSelected) {
      this.drawReticle(0xffffff);
    } else {
      this.reticle.clear();
    }
  }

  delete() {
    this.reticle.clear();
  }

  update(deltaTime) {
    this.updateReticle();
  }
}
