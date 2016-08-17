import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {ShowSidebarEvent} from "./gui-editor.events";

@Injectable()
export class GuiEditorService {
    // Observable sources
    private sidebarEvents = new Subject<ShowSidebarEvent>();
    
    // Observable streams
    public publishedSidebarEvents = this.sidebarEvents.asObservable();
    
    publishSidebarEvent(guiEditorEvent: ShowSidebarEvent) {
        this.sidebarEvents.next(guiEditorEvent);
    }
}
