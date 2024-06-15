import { MovementComponent } from '../shared/MovementComponent.js';
import { InteractionComponent } from './InteractionComponent.js';
import { log } from '../shared/helpers.js'

export class BaseActor extends Phaser.GameObjects.Container {
  constructor({scene, x, y} = {}) {
    super(scene, x, y);

    this.scene = scene;
    scene.add.existing(this);

    this.scene.physics.world.enable(this);

    // Create the main sprite and add it to the container
    this.sprite = scene.add.sprite(0, 0, classData.texture);
    this.add(this.sprite);

    this.refreshSize();

    this.setInteractive();
    this.body.setCollideWorldBounds(false);

    this.needsUpdate = false;
    this.needsMovementUpdate = false;
    this.updates = [];

    this.movementComponent = new MovementComponent({ actor: this });
    this.InteractionComponent = new InteractionComponent({actor: this})
    
    log.debug("BaseActor spawned")
  }

  refreshSize() {
    let {x, y, width, height} = this.getBounds()
    this.setSize(width, height);
  }

  delete() {
    this.InteractionComponent.delete();
    this.destroy();
  }

  setVisiblity(state) {
    this.setVisible(state);

    this.children.forEach((child) => {
        child.setVisible(state);
    });
  }

  update(deltaTime) {
    this.movementComponent.update(deltaTime);
    this.InteractionComponent.update(deltaTime);
  }
}
