import {SidebarType} from "./sidebar.type";
import {EventType} from "./event.type";

/** TODO: refactor this when we know more about the models of the properties */
export interface SidebarEvent {
    eventType: EventType,
    sidebarType: SidebarType;
    data?: {
        id: string,
        type: string,
        value: string
    }
}
