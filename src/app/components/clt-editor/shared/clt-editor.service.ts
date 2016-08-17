import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SidebarEvent} from "../../sidebar/shared/sidebar.events";

@Injectable()
export class CltEditorService {
    
    // Observable streams
    public sidebarEvents: BehaviorSubject<SidebarEvent> = new BehaviorSubject<SidebarEvent>(undefined);
}
