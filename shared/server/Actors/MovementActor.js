import { ReplicatedBase } from './ReplicatedBase.js';
export class MovementActor extends ReplicatedBase {
    constructor({ id, pos, parentActor }) {
        super({ id, pos, parentActor });
        this.velocity = { x: 0, y: 0 };
        this._lastVelocity = { x: 0, y: 0 };
    }
    setMovementUpdateFromClient(update) {
        Object.assign(this, update);
    }
    update(deltaTime) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
//# sourceMappingURL=MovementActor.js.map