import { ReplicatedBase, ReplicatedBaseConstructor, Vector2d } from './ReplicatedBase';
import { MovementUpdate } from "../../shared/MovementComonent";

export interface MovementActorConstructor extends ReplicatedBaseConstructor {

}

export class MovementActor extends ReplicatedBase {
    public velocity: Vector2d;
    private _lastVelocity: Vector2d;

    constructor({ id, pos, parentActor }: MovementActorConstructor) {
        super({ id, pos, parentActor });
        
        this.velocity = { x: 0, y: 0 };
        this._lastVelocity = { x: 0, y: 0 };
    }
    
    public setMovementUpdateFromClient(update: MovementUpdate) {    
        Object.assign(this, update);
    }  

    public update(deltaTime: number) {
        super.update(deltaTime); // Call the parent class's update method, if it exists
        // Add custom update logic here...
    }
}
