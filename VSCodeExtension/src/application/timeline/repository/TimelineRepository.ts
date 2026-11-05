import { readFile } from 'node:fs/promises';
import * as path from 'path';
import { Timeline } from '../../../domain/timeline/Timeline';
import { CommitPoint } from '../../../domain/timeline/CommitPoint';

export class TimelineRepository {
    private readonly scriptPath: string;

    constructor(extensionPath: string) {
        this.scriptPath = path.join(extensionPath, 'script');
    }

    async getTimelines(): Promise<Array<Timeline | CommitPoint>> {
        const data = await readFile(path.join(this.scriptPath, 'tdd-preview.json'), 'utf8')
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
                return readFile(path.join(this.scriptPath, 'tdd_log.json'), 'utf8');
            });

        const timeline: Array<Timeline | CommitPoint> = [];
        for (const item of JSON.parse(data)) {
            if (item.numPassedTests !== undefined && item.numTotalTests !== undefined) {
                timeline.push(new Timeline(
                    item.numPassedTests,
                    item.numTotalTests,
                    new Date(item.timestamp),
                    item.success
                ));
            } else if (item.commitId && item.commitTimestamp) {
                timeline.push(new CommitPoint(
                    item.commitId,
                    item.commitName,
                    new Date(item.commitTimestamp)
                ));
            }
        }
        return timeline;
    }
}
