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
    data: Object
}

export interface ShowSidebarEvent extends GuiEditorEvent {
    data: {
        sidebarType: SidebarType
    }
}

@Injectable()
export class GuiEditorService {
    // Observable sources
    private guiEditorEvents = new Subject<GuiEditorEvent>();

    // Observable streams
    public publishedEditorEvents = this.guiEditorEvents.asObservable();

    // Published events
    publishEditorEvent(guiEditorEvent: GuiEditorEvent) {
        this.guiEditorEvents.next(guiEditorEvent);
    }
}
