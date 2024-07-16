import { FlightActor, FlightActorConstructor } from '../../shared_src/Actors/FlightActor';
interface ServerFlightActorConstructor extends FlightActorConstructor {
}
export declare class ServerActor extends FlightActor {
    private controller;
    private _classData;
    private hardpoints;
    private autoPilotActive;
    constructor({ id, pos, parentActor }: ServerFlightActorConstructor);
    setController(controller: any): void;
    setHardpoint(id: number, hardpoint: any): void;
    clearHardpoint(id: number): void;
    update(deltaTime: number): void;
}
export {};
