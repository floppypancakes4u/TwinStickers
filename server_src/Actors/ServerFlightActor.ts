import { FlightActor, FlightActorConstructor } from '../../shared_src/Actors/FlightActor';
import { log } from '../../shared/Helpers';

interface HardpointMount {
  x: number;
  y: number;
  actor: any | null;
}

interface ClassData {
  texture: string;
  hardpointMounts: { [key: number]: HardpointMount };
}

interface ServerFlightActorConstructor extends FlightActorConstructor {
  
}

export class ServerActor extends FlightActor {
  private controller: any;
  private _classData: ClassData;
  private hardpoints: Map<number, HardpointMount>;
  private autoPilotActive: boolean;

  constructor({ id,pos,parentActor }: ServerFlightActorConstructor) {
    super({ id, pos, parentActor});

    this.controller = null;
    this.autoPilotActive = false;

    this.hardpoints = new Map<number, HardpointMount>();

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

  setController(controller: any): void {
    this.controller = controller;
  }

  setHardpoint(id: number, hardpoint: any): void {
    const hardpointMount = this.hardpoints.get(id);
    if (hardpointMount) {
      hardpointMount.actor = hardpoint;
      log.debug(`Hardpoint ${id} set for actor`, this);
    }
  }

  clearHardpoint(id: number): void {
    this.hardpoints.delete(id);
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    //if (this.autoPilotActive) this.handleAutopilot(deltaTime);

    this.hardpoints.forEach((hardpoint) => {
      if (hardpoint.actor) {
        hardpoint.actor.update(deltaTime);
      }
    });
  }
}
