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

  drawReticle(color) {
    //console.log("drawReticle called")
    const { x, y, width, height } = this.actor.getBounds();
    //console.log({ x, y, width, height })
    const cornerSize = 5;

    this.reticle.clear();
    this.reticle.lineStyle(2, color, 1);
    this.reticle.strokeLineShape(new Phaser.Geom.Line(x, y, x + cornerSize, y));
    this.reticle.strokeLineShape(new Phaser.Geom.Line(x, y, x, y + cornerSize));
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x + width, y, x + width - cornerSize, y)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x + width, y, x + width, y + cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x, y + height, x + cornerSize, y + height)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(x, y + height, x, y + height - cornerSize)
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        x + width,
        y + height,
        x + width - cornerSize,
        y + height
      )
    );
    this.reticle.strokeLineShape(
      new Phaser.Geom.Line(
        x + width,
        y + height,
        x + width,
        y + height - cornerSize
      )
    );
  }

  updateReticle() {
    console.log(this.actorHovered, this.actorSelected)
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

  destroy() {
    this.reticle.clear();
  }

  update(deltaTime) {
    this.updateReticle();
  }
}
