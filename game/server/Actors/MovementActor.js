import { ReplicatedBase } from './ReplicatedBase';
import { MovementComponent } from "../../../shared/MovementComponent.js";
export class MovementActor extends ReplicatedBase {
    constructor({ id, pos, parentActor }) {
        super({ id, pos, parentActor });
        this.needsMovementUpdate = false;
        this.movementComponent = new MovementComponent({ actor: this });
    }
    update(deltaTime) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
//# sourceMappingURL=MovementActor.js.map