// import { MathHelper } from "./MathHelper";
import { Vector2d } from "../../shared/Helpers";

interface CPUConstructor {
    id: string;
    parentActor: any;
}

interface DataMessage {
    name: string;
    data: string;
    timestamp: number;
}

export class ReplicatedBase {
    private id: string;
    private pos: Vector2d;  

    constructor({ }: CPUConstructor) {
    this.id = id;
    this.parentActor = parentActor;
    this.eventBusBuffer = [];  
    this.active = false;
    }

    private verifyValidData(data: DataMessage): boolean {
        if (data.name == null) return false;
        if (data.name == "") return false;
        
        if (data.data == null) return false;

        return true;
    }

    public addData(data: DataMessage): boolean {
        if (!this.verifyValidData(data)) return false;

        data.timestamp = Date.now();

        this.eventBusBuffer.push(data);

        return true;
    }
}