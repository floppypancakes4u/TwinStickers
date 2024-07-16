import { ReplicatedBase } from './ReplicatedBase';
export class MovementActor extends ReplicatedBase {
    constructor({ id, pos, parentActor }) {
        super({ id, pos, parentActor });
        this.velocity = { x: 0, y: 0 };
        this._lastVelocity = { x: 0, y: 0 };
    }
    setMovementUpdateFromClient(data) {
        Object.assign(this, data);
    }
    update(deltaTime) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
//# sourceMappingURL=MovementActor.js.map