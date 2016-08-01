import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

export enum SidebarType {
    expression,
    editor
}

export enum GuiEditorEventType {
    showSidebar
}

export interface GuiEditorEvent {
    type: GuiEditorEventType,
    data: any
}

@Injectable()
export class GuiEditorService {
    // Observable sources
    private guiEditorEvents = new Subject<any>();

    // Observable streams
    public publishedEditorEvents = this.guiEditorEvents.asObservable();

    // Published events
    publishEditorEvent(guiEditorEvent: GuiEditorEvent) {
        this.guiEditorEvents.next(guiEditorEvent);
    }
}
