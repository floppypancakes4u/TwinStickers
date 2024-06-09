export default class Camera {
  constructor(scene) {
      this.scene = scene;
      this.camera = scene.cameras.main;
  }

  // Method to follow an actor
  followActor(actor) {
      this.camera.startFollow(actor);
      //this.cameras.main.startFollow(this.focusedActor);
  }

  // Method to move to a specific position
  moveTo(x, y, speed = 0) {
      this.camera.pan(x, y, speed);
  }

  // Additional camera methods (e.g., zoom, rotate)
  setZoom(zoomLevel) {
      this.camera.setZoom(zoomLevel);
  }
}