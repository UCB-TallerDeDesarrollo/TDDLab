export class Timeline {
    constructor(
        public numPassedTests: number,
        public numTotalTests: number,
        public timestamp: Date,
        public success: Boolean
    ) {}

    getColor(): string {
        return this.success && this.numTotalTests !== 0 ? "green" : "red";    
    }
}
