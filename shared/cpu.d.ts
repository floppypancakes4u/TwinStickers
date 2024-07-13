interface CPUConstructor {
    id: string;
    parentActor: any;
}
interface DataMessage {
    name: string;
    data: string;
    timestamp: number;
}
export declare class CPU {
    private id;
    private parentActor;
    private eventBusBuffer;
    private active;
    constructor({ id, parentActor, }: CPUConstructor);
    private verifyValidData;
    addData(data: DataMessage): boolean;
}
export {};
