import { FlightActor } from '../../shared_src/Actors/FlightActor';
import { log } from '../../shared/Helpers';
export class ServerActor extends FlightActor {
    constructor({ id, pos, parentActor }) {
        super({ id, pos, parentActor });
        this.controller = null;
        this.autoPilotActive = false;
        this.hardpoints = new Map();
        // Uncomment and use if needed
        // console.log('this._classData', this._classData);
        // Setup hardpoints
        Object.keys(this._classData.hardpointMounts).forEach((key) => {
            const index = parseInt(key, 10);
            const mount = this._classData.hardpointMounts[index];
            this.hardpoints.set(index, mount);
        });
        // Uncomment and use if needed
        // this.setHardpoint(1, new BeamHardpoint({ id: 'testBeam', parentActor: this }));
        // this.setHardpoint(2, new ProjectileHardpoint({ id: 'testProjectile', parentActor: this }));
    }
    setController(controller) {
        this.controller = controller;
    }
    setHardpoint(id, hardpoint) {
        const hardpointMount = this.hardpoints.get(id);
        if (hardpointMount) {
            hardpointMount.actor = hardpoint;
            log.debug(`Hardpoint ${id} set for actor`, this);
        }
    }
    clearHardpoint(id) {
        this.hardpoints.delete(id);
    }
    update(deltaTime) {
        super.update(deltaTime);
        //if (this.autoPilotActive) this.handleAutopilot(deltaTime);
        this.hardpoints.forEach((hardpoint) => {
            if (hardpoint.actor) {
                hardpoint.actor.update(deltaTime);
            }
        });
    }
}
//# sourceMappingURL=ServerFlightActor.js.map