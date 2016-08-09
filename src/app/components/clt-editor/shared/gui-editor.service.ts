import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {SidebarEvent} from "./gui-editor.events";

@Injectable()
export class GuiEditorService {
    // Observable sources
    private sidebarEvents = new Subject<SidebarEvent>();
    
    // Observable streams
    public publishedSidebarEvents = this.sidebarEvents.asObservable();

    publishSidebarEvent(sidebarEvent: SidebarEvent) {
        this.sidebarEvents.next(sidebarEvent);
    }
}
