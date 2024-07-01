import { Controller } from './utility/controller.js';
import { ActorManagerClient } from './utility/ActorManagerClient.js';
import { log } from './shared/Helpers.js';

var culledActorsCount = 0;

class World extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.setupSockets();

    this.load.setBaseURL('https://labs.phaser.io');

    // this.load.image('sky', 'assets/skies/space3.png');
    // this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    // this.load.image('red', 'assets/particles/red.png');
    // this.load.image('blue', 'assets/particles/blue.png');
    // this.load.image('background', 'assets/tests/space/nebula.jpg');
    // this.load.image('stars', 'assets/tests/space/stars.png');
    // this.load.image('ship', 'assets/sprites/x2kship.png');

    
    this.load.setBaseURL('https://twinstickers-mgwe--3000--9e2d28a3.local-credentialless.webcontainer.io/');
    this.load.image('ship', 'static/assets/x2kship.png');
    this.load.image('dev_mining_turret', 'static/assets/turret_02_mk1.png');
    //this.load.image('dev_mining_turret_beam', 'static/assets/turret_02_beam_01_anim.gif');
    this.load.spritesheet('dev_mining_turret_beam', 'static/assets/test.png', { frameWidth: 32, frameHeight: 32});
    this.load.image('blue', 'static/assets/blue.png');
  
  }

  create() {

    this.anims.create({
      key: 'beamAnimation',
      frames: this.anims.generateFrameNumbers('dev_mining_turret_beam', { frames: [0, 1, 2, 3, 4] }),
      frameRate: 10, // Set the frame rate as needed
      repeat: -1 // Repeat indefinitely
  });

    this.input.mouse.disableContextMenu();

    // Black background
    this.cameras.main.setBackgroundColor('#000000');

    // Create infinite grid
    this.createGrid();

    // Initialize the ActorManager
    ActorManagerClient.init(this);
    this.controller = new Controller(this);
    ActorManagerClient.setController(this.controller);

    // Add camera controls
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.isPanning = true;
        this.startX = pointer.x;
        this.startY = pointer.y;
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer.rightButtonReleased()) {
        this.isPanning = false;
        this.focusedActor = null;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isPanning) {
        this.cameras.main.scrollX -=
          (pointer.x - this.startX) / this.cameras.main.zoom;
        this.cameras.main.scrollY -=
          (pointer.y - this.startY) / this.cameras.main.zoom;
        this.startX = pointer.x;
        this.startY = pointer.y;
      }
    });

    this.input.keyboard.on('keydown-F', () => {
      if (this.selectedActor) {
        this.focusedActor = this.selectedActor;
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const actors = this.physics.overlapRect(
          worldPoint.x,
          worldPoint.y,
          1,
          1
        );
        if (actors.length > 0) {
          if (this.selectedActor) {
            this.selectedActor.selected = false;
          }
          this.selectedActor = actors[0].gameObject;
          this.selectedActor.selected = true;
        }
      }
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.cameras.main.zoom -= deltaY * 0.001;
      this.cameras.main.zoom = Phaser.Math.Clamp(
        this.cameras.main.zoom,
        0.1,
        2
      );
    });

    this.actors = this.add.group();
    this.createUI();
  }

  calculatePerformances() {
    if (averageFrameTimes.length === 0 || averageFPSs.length === 0) {
      averageFrameTime = 0;
      averageFPS = 0;
    }

    const sumFrameTimes = averageFrameTimes.reduce((a, b) => a + b, 0);
    const sumFPSs = averageFPSs.reduce((a, b) => a + b, 0);

    const frameTime = sumFrameTimes / averageFrameTimes.length;
    const fps = sumFPSs / averageFPSs.length;

    averageFrameTime = frameTime;
    averageFPS = fps;
  }

  update(time, delta) {
    culledActorsCount = 0;

    if (this.focusedActor) {
      //this.cameras.main.startFollow(this.focusedActor);
    } else {
      this.cameras.main.stopFollow();
    }

    // Get the camera's viewport
    const camBounds = this.cameras.main.worldView;

    for (const actor of ActorManagerClient.actors.values()) {
      const actorBounds = actor.getBounds();
      const intersects = Phaser.Geom.Intersects.RectangleToRectangle(
        actorBounds,
        camBounds
      );

      //console.log(`Actor: ${actor.id} ${actor.constructor.name}, Bounds: ${JSON.stringify(actorBounds)}, Intersects: ${intersects}`);

      if (intersects) {
        actor.update(delta);
        actor.setVisiblity(true)
      } else {
        culledActorsCount++;
        actor.setVisiblity(false)
        //log(`Culling actor: ${actor.id}`);
      }
    }

    this.updateUI(culledActorsCount);
    this.updateGrid();
    this.controller.update(delta);
  }

  createGrid() {
    this.gridGraphics = this.add.graphics({
      lineStyle: { width: 1, color: 0x444444 },
    });
  }

  updateGrid() {
    const camera = this.cameras.main;
    const gridSize = 50;

    this.gridGraphics.clear();

    const startX =
      Math.floor(camera.scrollX / gridSize) * gridSize - camera.width / 2;
    const endX =
      Math.floor((camera.scrollX + camera.width) / gridSize) * gridSize +
      camera.width / 2;
    const startY =
      Math.floor(camera.scrollY / gridSize) * gridSize - camera.height / 2;
    const endY =
      Math.floor((camera.scrollY + camera.height) / gridSize) * gridSize +
      camera.height / 2;

    for (let x = startX; x <= endX; x += gridSize) {
      this.gridGraphics.moveTo(x, startY);
      this.gridGraphics.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += gridSize) {
      this.gridGraphics.moveTo(startX, y);
      this.gridGraphics.lineTo(endX, y);
    }

    this.gridGraphics.strokePath();
  }

  createUI() {
    this.uiOverlay = document.createElement('div');
    this.uiOverlay.style.position = 'fixed';
    this.uiOverlay.style.top = '0';
    this.uiOverlay.style.left = '0';
    this.uiOverlay.style.width = '100%';
    this.uiOverlay.style.height = '100%';
    this.uiOverlay.style.pointerEvents = 'none';
    document.body.appendChild(this.uiOverlay);

    this.uiText = document.createElement('div');
    this.uiText.style.position = 'absolute';
    this.uiText.style.top = '10px';
    this.uiText.style.left = '10px';
    this.uiText.style.color = 'white';
    this.uiText.style.fontSize = '16px';
    this.uiOverlay.appendChild(this.uiText);

    this.spawnButton = document.createElement('button');
    this.spawnButton.innerText = 'Spawn Actor';
    this.spawnButton.style.position = 'absolute';
    this.spawnButton.style.top = '10px';
    this.spawnButton.style.right = '10px';
    this.spawnButton.style.pointerEvents = 'all';
    this.uiOverlay.appendChild(this.spawnButton);

    this.deleteButton = document.createElement('button');
    this.deleteButton.innerText = 'Delete Actor';
    this.deleteButton.style.position = 'absolute';
    this.deleteButton.style.top = '50px';
    this.deleteButton.style.right = '10px';
    this.deleteButton.style.pointerEvents = 'all';
    this.uiOverlay.appendChild(this.deleteButton);

    this.spawnButton.addEventListener('click', () => {
      const cameraPosition = this.cameras.main.getWorldPoint(
        this.cameras.main.centerX,
        this.cameras.main.centerY
      );

      ActorManagerClient.requestSpawnActor(
        cameraPosition.x,
        cameraPosition.y,
        'ship',
        {
          roam: true,
        },
        {
          qty: 100,
        }
      );
    });

    this.deleteButton.addEventListener('click', () => {
      if (this.selectedActor) {
        ActorManagerClient.requestDeleteActor(this.selectedActor.id);
      }
    });
  }

  updateUI() {
    const cameraCenter = this.cameras.main.midPoint;
    const mouseWorldPoint = this.input.activePointer.positionToCamera(
      this.cameras.main
    );
    const selectedActorPos = this.selectedActor
      ? `${this.selectedActor.x}, ${this.selectedActor.y}`
      : 'None';
    const zoom = this.cameras.main.zoom.toFixed(2);
    const playerActor = this.controller.playerEntity;

    this.uiText.innerHTML = `
      Camera Center: ${cameraCenter.x.toFixed(2)}, ${cameraCenter.y.toFixed(
      2
    )}<br>
      Mouse World: ${mouseWorldPoint.x.toFixed(2)}, ${mouseWorldPoint.y.toFixed(
      2
    )}<br>
      Actor Position: ${selectedActorPos}<br>
      My Speed: ${playerActor?.movementComponent.getSpeed().toFixed(2) || 0}<br>
      Thrusting: ${playerActor?.inputStates.thrustForward}<br>
      Braking: ${playerActor?.inputStates.braking}<br>
      Zoom: ${zoom}<br>
      Total Known Actors: ${ActorManagerClient.actors.size}<br>
      Culled Actors: ${culledActorsCount}<br>
      Avg Frame Time: ${false}<br>
      Avg FPS: ${false}
    `;
  }

  resize() {
    const canvas = this.sys.game.canvas;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wratio = width / height;
    const ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
      canvas.style.width = width + 'px';
      canvas.style.height = width / ratio + 'px';
    } else {
      canvas.style.width = height * ratio + 'px';
      canvas.style.height = height + 'px';
    }

    this.cameras.resize(width, height);
  }

  setupSockets() {
    this.socket = io('http://localhost:3000'); // Adjust the URL as necessary

    // Connection opened
    this.socket.on('connect', () => {
      log.debug('Connected to the Socket.io server');
      // Send a message to the server
      this.socket.emit('message', 'Hello, server!');
    });

    // Listen for messages from the server
    this.socket.on('message', (data) => {
      log.debug('Message from server:', data);
    });

    // Listen for possible errors
    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    // Handle the socket closing
    this.socket.on('disconnect', (reason) => {
      log.debug('Socket.io connection closed:', reason);
    });

    log.debug('Setup Sockets called');
  }

  shutdown() {
    document.body.removeChild(this.uiOverlay);
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: World,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'phaser-example',
    width: '100%',
    height: '100%',
  },
};

const Game = new Phaser.Game(config);
