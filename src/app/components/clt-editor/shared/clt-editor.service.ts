import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {SidebarEvent} from "../../sidebar/shared/sidebar.events";

@Injectable()
export class CltEditorService {
    // Observable sources
    private sidebarEvents = new Subject<SidebarEvent>();
    
    // Observable streams
    public publishedSidebarEvents = this.sidebarEvents.asObservable();

    publishSidebarEvent(sidebarEvent: SidebarEvent) {
        this.sidebarEvents.next(sidebarEvent);
    }
}
