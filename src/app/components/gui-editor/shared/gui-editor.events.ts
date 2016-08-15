import {SidebarType} from "./sidebar.types";

export interface ShowSidebarEvent {
    data: {
        sidebarType: SidebarType
    }
}
