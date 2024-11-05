import * as vscode from 'vscode';
import { Timeline } from '../domain/Timeline';
import { TimelineRepository } from '../repository/TimelineRepository';

export class GetTimeline  {
    private timelineRepository: TimelineRepository;

    constructor(rootPath: string) {
        this.timelineRepository = new TimelineRepository(rootPath);        
    }

    async execute(): Promise<Timeline[]> {
        let response: Timeline[] = [];
        try {
            const timeline = await this.timelineRepository.getTimelines();
            response = timeline;
        } catch {
            vscode.window.showErrorMessage('Error al obtener la linea de tiempo.');
        }
        return response;
    }

}
