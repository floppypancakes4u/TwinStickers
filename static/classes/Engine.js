export class Engine {
  constructor({ scene, actor, x, y, data = {} }) {
    this.scene = scene;
    this.actor = actor;
    this.offsetX = x;
    this.offsetY = y;
    this.isThrusting = false;

    this.emitter = this.scene.add.particles(0, 0, 'blue', {
      speed: 100,
      lifespan: {
        onEmit: (particle, key, t, value) => {
          return (
            Phaser.Math.Percent(
              this.actor.movementComponent.getSpeed(),
              0,
              750
            ) * 2000
          );
        },
      },
      alpha: {
        onEmit: (particle, key, t, value) => {
          return Phaser.Math.Percent(
            this.actor.movementComponent.getSpeed(),
            0,
            200
          );
        },
      },
      angle: {
        onEmit: (particle, key, t, value) => {
          return this.actor.angle - 180 + Phaser.Math.Between(-2, 2);
        },
      },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
    });

    // Remove the default follow behavior
    // this.emitter.startFollow(this.actor);
  }

  setVisibility(state) {
    //if (state) {
      this.emitter.setVisible(state)
    //}
  }

  SetThrusting(state) {
    this.isThrusting = state;

    if (state) {
      this.emitter.start();
    } else {
      this.emitter.stop();
    }
  }

  update() {
    // Calculate the offset position
    const offsetX =
      this.offsetX * Math.cos(this.actor.rotation) -
      this.offsetY * Math.sin(this.actor.rotation);
    const offsetY =
      this.offsetX * Math.sin(this.actor.rotation) +
      this.offsetY * Math.cos(this.actor.rotation);

    // Set the emitter position based on the actor's position and the offset
    this.emitter.setPosition(this.actor.x + offsetX, this.actor.y + offsetY);
  }
}
