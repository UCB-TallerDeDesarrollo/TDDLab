"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
class Timeline {
    numPassedTests;
    numTotalTests;
    timestamp;
    constructor(numPassedTests, numTotalTests, timestamp) {
        this.numPassedTests = numPassedTests;
        this.numTotalTests = numTotalTests;
        this.timestamp = timestamp;
    }
    isSuccessful() {
        return this.numPassedTests === this.numTotalTests;
    }
}
exports.Timeline = Timeline;
//# sourceMappingURL=Timeline.js.map