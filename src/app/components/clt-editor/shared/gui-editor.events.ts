import {SidebarType} from "./sidebar.enums";

export interface SidebarEvent {
    data: {
        sidebarType: SidebarType;
    }
}
