export class PushPoint {
    public pushId: string;
    public pushTimestamp: Date;

    constructor(pushId: string, pushTimestamp: Date) {
        this.pushId = pushId;
        this.pushTimestamp = pushTimestamp;
    }
}
