import * as fs from 'fs';
import * as path from 'path';
import { Timeline } from '../domain/Timeline';
import { CommitPoint } from '../domain/CommitPoint';

export class TimelineRepository {
    private readonly filePath: string;

    constructor(extensionPath: string) {
        this.filePath = path.join(extensionPath, 'script', 'tdd_log.json');
    }

    async getTimelines(): Promise<Array<Timeline | CommitPoint >> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, 'utf8', (err, data) => {
                if (err) {
                    return reject(new Error(JSON.stringify(err)));
                }
                try {
                    const jsonData = JSON.parse(data);
                    const timeline: Array<Timeline | CommitPoint > = [];
                    jsonData.forEach((item: any) => {
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
                    });
                    resolve(timeline);
                } catch (error) {
                    reject(new Error('Error al parsear el archivo JSON'));
                }
            });
        });
    }
}
