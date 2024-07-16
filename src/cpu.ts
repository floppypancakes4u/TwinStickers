// import { MathHelper } from "./MathHelper";

interface CPUConstructor {
    id: string;
    parentActor: any;
}

interface DataMessage {
    name: string;
    data: string;
    timestamp: number;
}

export class CPU {
    private id: string;
    private parentActor: any;  
    private eventBusBuffer: DataMessage[];
    private active: boolean;

    constructor({ id, parentActor, }: CPUConstructor) {
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