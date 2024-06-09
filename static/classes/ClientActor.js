import { MovementComponent } from '../shared/MovementComponent.js';
import { Engine } from './Engine.js';

export class ClientActor extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, texture, frame } = {}) {
    super(scene, x, y, texture, frame);

    this.scene = scene;
    scene.add.existing(this);

    this.setInteractive();
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(false);

    this.reticle = this.scene.add.graphics();

    this.hovered = false;
    this.selected = false;

    this.velocity = { x: 0, y: 0 };
    this.rotation = 0; // Ensure rotation is defined

    this.autoPilotActive = false;
    this.autoPilotTarget = {
      target: null,
      x: null,
      y: null,
    };

    this.thrust = 200;
    this.brakingThrust = this.thrust / 5;
    this.maxSpeed = 100;
    this.weight = {
      base: 10000,
      effective: 10000,
    };

    this.inputStates = {
      thrustForward: false,
      braking: false,
      rotateLeft: false,
      rotateRight: false,
      space: false,
    };

    this.controller = null;

    this.movementComponent = new MovementComponent({ actor: this });
    this.engines = [
      new Engine({ scene, actor: this, x: -22, y: -6.5 }),
      new Engine({ scene, actor: this, x: -22, y: 6.5 }),
    ];

    this.on('pointerover', () => {
      this.hovered = true;
      this.controller.setHoveredEntity(this);
    });

    this.on('pointerout', () => {
      this.hovered = false;
      if (!this.selected) {
        this.reticle.clear();
        this.controller.setHoveredEntity(null);
      }
    });
  }

  setController(controller) {
    this.controller = controller;
  }

  drawReticle(color) {
    const { x, y, width, height } = this.getBounds();
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
    if (this.hovered && !this.selected) {
      this.drawReticle(0x636262);
      return;
    }

    if (this.selected) {
      this.drawReticle(0xffffff);
    } else {
      this.reticle.clear();
    }
  }

  prepForDestroy() {
    this.selected = false;
    this.reticle.clear();
  }

  setThrustForwardState(pressed) {
    this.inputStates.thrustForward = pressed;

    this.engines.forEach((engine) => {
      engine.SetThrusting(pressed);
    });
  }

  brake(pressed) {
    this.inputStates.braking = pressed;
  }

  rotateLeft(pressed) {
    this.inputStates.rotateLeft = pressed;
  }

  rotateRight(pressed) {
    this.inputStates.rotateRight = pressed;
  }

  setAutopilotTarget({ target = null, x = null, y = null }) {
    this.autoPilotActive = true;
    this.autoPilotTarget = {
      target,
      x,
      y,
    };
  }

  handleAutopilot() {
    // Calculate distance and angle to target
    const dx = this.autoPilotTarget.target.x - this.x;
    const dy = this.autoPilotTarget.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angleToTarget = Math.atan2(dy, dx);

    // Predict future position of the target (simple prediction)
    const futureTargetX =
      this.autoPilotTarget.target.x +
      this.autoPilotTarget.target.velocity.x * 0.1;
    const futureTargetY =
      this.autoPilotTarget.target.y +
      this.autoPilotTarget.target.velocity.y * 0.1;
    const futureDx = futureTargetX - this.autoPilotTarget.target.x;
    const futureDy = futureTargetY - this.autoPilotTarget.target.y;
    const futureAngleToTarget = Math.atan2(futureDy, futureDx);

    // Adjust heading towards future position of the target
    const angleDiff = Phaser.Math.Angle.Wrap(
      futureAngleToTarget - this.heading
    );
    if (angleDiff > 0.1) {
      this.heading += 0.05; // Rotate right
    } else if (angleDiff < -0.1) {
      this.heading -= 0.05; // Rotate left
    }

    // Move forward
    this.velocity.x = Math.cos(this.heading) * this.speed;
    this.velocity.y = Math.sin(this.heading) * this.speed;

    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Update sprite rotation to match heading (pointing right by default)
    this.rotation = this.heading;
  }

  // handleAutoPilot() {
  //   let distance = 1000000000000000;
  //   let x = 0;
  //   let y = 0;

  //   if (this.autoPilotTarget.target && this.autoPilotTargettarget instanceof ClientActor) {

  //   }

  //   if (this.autoPilotTarget.x && this.autoPilotTarget.y) {
  //     x = this.autoPilotTarget.x;
  //     y = this.autoPilotTarget.y;

  //     distance = this.movementComponent.distanceTo({x, y})
  //     this.movementComponent.turnTowardsTarget({x, y, distance})
  //   }

  //     const { shouldThrust, shouldBrake } =
  //       this.movementComponent.handleAccelerationToTarget({
  //         x,
  //         y,
  //         distance,
  //       });

  //     this.setThrustForwardState(shouldThrust)
  //     this.brake(shouldBrake)

  //     console.log({ shouldThrust, shouldBrake })
  //     // if (shouldBrake) {
  //     //   this.applyDeceleration();
  //     // }
  // }

  disableAutopilot() {
    this.movementComponent.disableAutopilot();
  }

  update(deltaTime) {
    this.updateReticle();
    //this.movementComponent.updateStates(this.inputStates);
    if (this.autoPilotActive) this.handleAutopilot();
    this.movementComponent.update(deltaTime);

    this.engines.forEach((engine) => {
      engine.update();
    });
  }
}
