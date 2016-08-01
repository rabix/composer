import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {GuiEditorEvent} from "./gui-editor.events";

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
