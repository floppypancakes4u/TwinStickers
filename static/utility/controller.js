import Camera from './camera.js';
import { ActorManagerClient } from './ActorManagerClient.js';

export class Controller {
  constructor(scene) {
    this.scene = scene;
    this.camera = new Camera(scene);
    this.socket = scene.socket;
    this.playerEntity = null;
    this.hoveredEntity = null;
    this.focusedEntity = null;

    this.setupInputListeners();

    // const deltaTime = 0.016; // Approximate time between frames (60 FPS)
    // setInterval(() => {
    //   this.update(deltaTime);
    // }, deltaTime * 1000); // 16ms for 60 FPS

    // setInterval(() => {
    //   if (this.focusedEntity != null) this.followFocusedEntity();
    // }, 0);
  }

  setupInputListeners() {
    this.scene.input.keyboard.on('keydown-W', () => {
      if (this.playerEntity) this.playerEntity.setThrustForwardState(true);
    });

    this.scene.input.keyboard.on('keyup-W', () => {
      if (this.playerEntity) this.playerEntity.setThrustForwardState(false);
    });

    this.scene.input.keyboard.on('keydown-S', () => {
      if (this.playerEntity) this.playerEntity.inputStates.braking = true;
    });

    this.scene.input.keyboard.on('keyup-S', () => {
      if (this.playerEntity) this.playerEntity.inputStates.braking = false;
    });

    this.scene.input.keyboard.on('keydown-A', () => {
      if (this.playerEntity) this.playerEntity.inputStates.rotateLeft = true;
    });

    this.scene.input.keyboard.on('keyup-A', () => {
      if (this.playerEntity) this.playerEntity.inputStates.rotateLeft = false;
    });

    this.scene.input.keyboard.on('keydown-D', () => {
      if (this.playerEntity) this.playerEntity.inputStates.rotateRight = true;
    });

    this.scene.input.keyboard.on('keyup-D', () => {
      if (this.playerEntity) this.playerEntity.inputStates.rotateRight = false;
    });

    this.scene.input.keyboard.on('keydown-SPACE', () => {
      if (this.playerEntity) this.playerEntity.inputStates.space = true;
    });

    this.scene.input.keyboard.on('keyup-SPACE', () => {
      if (this.playerEntity) this.playerEntity.inputStates.space = false;
    });

    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.handleRightClick(pointer);
      }
    });

    this.socket.on('actorSpawned', (data) => {
      if (data.id === this.socket.id) {
        this.playerEntity = ActorManagerClient.getActorByID(data.id);
        this.playerEntity.setController(this);
        this.focusedEntity = this.playerEntity;
      }
    });
  }

  handleRightClick(pointer) {
    const worldPoint = this.scene.cameras.main.getWorldPoint(
      pointer.x,
      pointer.y
    );
    console.log(
      `Right-clicked at world coordinates: (${worldPoint.x}, ${worldPoint.y})`
    );

    // Check for objects at the clicked coordinates
    // const clickedObjects = this.scene.children.list.filter((child) => {
    //   return child.getBounds().contains(worldPoint.x, worldPoint.y);
    // });

    if (this.hoveredEntity) {
      console.log(`Right-clicked on object: ${this.hoveredEntity}`);
      this.playerEntity.setAutopilotTarget({ target: this.hoveredEntity });
    } else {
      console.log('No object was right-clicked.');
      this.playerEntity.setAutopilotTarget({
        x: worldPoint.x,
        y: worldPoint.y,
      });
    }
  }

  setFocusedEntity(ActorInstance) {
    this.focusedEntity = ActorInstance;
  }

  setHoveredEntity(ActorInstance) {
    this.hoveredEntity = ActorInstance;
    console.log('this hovered entity');
  }

  // followFocusedEntity() {
  //   //this.scene.cameras.main.startFollow(this.focusedEntity, true, 1, 1);

  //   var lerp = .1;

  //   let x = this.scene.cameras.main.x += (this.playerEntity.x - this.scene.cameras.main.x) * lerp
  //   let y = this.scene.cameras.main.y += (this.playerEntity.y - this.scene.cameras.main.y) * lerp

  //   //this.scene.cameras.main.centerOnX(x);// += ;
  //   // this.scene.cameras.main.centerOnY(y);

  //   this.scene.cameras.main.setScroll(this.playerEntity.x, y)
  // }

  followFocusedEntity() {
    this.scene.cameras.main.startFollow(this.focusedEntity);
    return;

    const lerp = 1;

    // Calculate the target position to center the playerEntity
    const targetX = this.playerEntity.x - this.scene.cameras.main.width / 2;
    const targetY = this.playerEntity.y - this.scene.cameras.main.height / 2;

    // Smoothly move the camera towards the target position
    this.scene.cameras.main.scrollX +=
      (targetX - this.scene.cameras.main.scrollX) * lerp;
    this.scene.cameras.main.scrollY +=
      (targetY - this.scene.cameras.main.scrollY) * lerp;
  }

  sendInput(action, data) {
    this.socket.emit('playerInput', { action, ...data });
  }

  update(deltaTime) {
    if (this.playerEntity) {
      if (this.focusedEntity != null) this.followFocusedEntity();
      // Update the playerEntity's state based on inputStates if necessary
    }
  }
}
