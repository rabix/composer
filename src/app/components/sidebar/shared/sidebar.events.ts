import {SidebarType} from "./sidebar.type";
import {BehaviorSubject} from "rxjs";

export enum SidebarEventType {
    Show,
    Hide
}

/** TODO: refactor this when we know more about the models of the properties */
export interface SidebarEvent {
    sidebarEventType: SidebarEventType,
    sidebarType?: SidebarType;
    data?: {
        stream: BehaviorSubject<any>
    }
}
