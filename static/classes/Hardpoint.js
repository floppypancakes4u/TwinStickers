export class Hardpoint {
    constructor({ scene, id, parentActor, x, y, classData = { texture: "dev_mining_turret"} }) {
        console.log({scene, id, parentActor, x, y, classData})
        this.scene = scene;
        this.id = id;
        this.parentActor = parentActor;
        this.offsetX = x;
        this.offsetY = y;
        this.targetActor = null;
    
        this.sprite = scene.add.sprite(0, 0, classData.texture);
        //this.add(this.sprite);

        //this.refreshSize();
    }
  
    setVisibility(state) {
      //if (state) {
        this.emitter.setVisible(state)
      //}
    }
  
  
    update() {
      // Calculate the offset position
      const offsetX =
        this.offsetX * Math.cos(this.parentActor.rotation) -
        this.offsetY * Math.sin(this.parentActor.rotation);
      const offsetY =
        this.offsetX * Math.sin(this.parentActor.rotation) +
        this.offsetY * Math.cos(this.parentActor.rotation);
  
      // Set the emitter position based on the actor's position and the offset
      this.emitter.setPosition(this.parentActor.x + offsetX, this.parentActor.y + offsetY);
    }
  }
  