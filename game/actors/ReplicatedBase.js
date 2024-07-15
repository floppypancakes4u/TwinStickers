export class ReplicatedBase {
    constructor({}) {
        this.id = id;
        this.parentActor = parentActor;
        this.eventBusBuffer = [];
        this.active = false;
    }
    verifyValidData(data) {
        if (data.name == null)
            return false;
        if (data.name == "")
            return false;
        if (data.data == null)
            return false;
        return true;
    }
    addData(data) {
        if (!this.verifyValidData(data))
            return false;
        data.timestamp = Date.now();
        this.eventBusBuffer.push(data);
        return true;
    }
}
//# sourceMappingURL=ReplicatedBase.js.map