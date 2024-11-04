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
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
        return response;
    }

}
