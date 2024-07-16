export class ReplicatedBase {
    constructor({ id, pos, parentActor = undefined }) {
        this.id = id;
        this.pos = pos;
        this._lastPos = pos;
        this.rotation = 0;
        this._lastRotation = 0;
        this.parentActor = parentActor;
        this.needsUpdate = false;
        this.classData = {};
        this.created = new Date();
    }
    requireUpdate() {
        this.needsUpdate = true;
    }
    // private clearUpdates() {
    //     this.needsUpdate = false;
    // }
    getUpdates(forceAll = false) {
        let updates = {};
        if (this._lastPos != this.pos || forceAll) {
            updates.pos = this.pos;
            this._lastPos = this.pos;
        }
        if (this._lastRotation != this.rotation || forceAll) {
            updates.rotation = this.rotation;
            this._lastRotation = this.rotation;
        }
        if (this._lastPos != this.pos || forceAll) {
            updates.pos = this.pos;
            this._lastPos = this.pos;
        }
        //this.clearUpdates();
        return updates;
    }
    getClientSpawnData() {
        return {
            id: this.id,
            parentActor: this.parentActor,
            created: this.created,
            MovementData: this.getUpdates(true),
        };
    }
    setRotation(rot) {
        this.rotation = rot;
        this.requireUpdate();
    }
    update(deltaTime) {
    }
}
//# sourceMappingURL=ReplicatedBase.js.map