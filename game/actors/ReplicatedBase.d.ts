interface CPUConstructor {
    id: string;
    parentActor: any;
}
interface DataMessage {
    name: string;
    data: string;
    timestamp: number;
}
export declare class ReplicatedBase {
    private id;
    private pos;
    constructor({}: CPUConstructor);
    private verifyValidData;
    addData(data: DataMessage): boolean;
}
export {};
