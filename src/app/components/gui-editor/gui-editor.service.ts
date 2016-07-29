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
    // Observable string sources
    private guiEditorEvents = new Subject<any>();

    // Observable string streams
    publishedEditorEvents = this.guiEditorEvents.asObservable();

    // Service message commands
    publishEditorEvent(guiEditorEvent: GuiEditorEvent) {
        this.guiEditorEvents.next(guiEditorEvent);
    }
}
